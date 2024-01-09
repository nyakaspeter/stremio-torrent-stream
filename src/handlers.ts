import { Handler, Request } from "express";
import Stremio from "stremio-addon-sdk";
import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";
import { JackettResult, search } from "./jackett.js";
import {
  getReadableSize,
  getStreamingMimeType,
  guessLanguage,
  guessQuality,
  isEpisodeNumberMatch,
  isVideoFile,
} from "./utils.js";
import {
  getFile,
  getOrAddTorrent,
  getTorrentInfo,
  updateAccessTime,
} from "./webtorrent.js";

interface StremioHandlerArgs {
  type: string;
  id: string;
  req: Request;
  config?: {
    jackettUrl: string;
    jackettKey: string;
  };
}

export const stremioStreamHandler = async ({
  type,
  id,
  req,
  config,
}: StremioHandlerArgs) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const jackettUrl = config?.jackettUrl || "";
  const jackettKey = config?.jackettKey || "";

  let streamsWithScores: { stream: Stremio.Stream; score: number }[] = [];

  if (type === "movie") {
    const torrents = await search(
      id,
      [JackettCategory.Movies],
      jackettUrl,
      jackettKey
    );
    torrents.filter((torrent) => !torrent.category?.includes("DVD"));
    torrents.filter((torrent) => torrent.seeds > 0);

    streamsWithScores = (
      await Promise.all(torrents.map((torrent) => getStreams(torrent, baseUrl)))
    ).flat();
  }

  if (type === "series") {
    const imdb = id.split(":")[0];
    const season = id.split(":")[1];
    const episode = id.split(":")[2];

    const torrents = await search(
      imdb,
      [JackettCategory.TV],
      jackettUrl,
      jackettKey
    );
    torrents.filter((torrent) => !torrent.category?.includes("DVD"));
    torrents.filter((torrent) => torrent.seeds > 0);

    streamsWithScores = (
      await Promise.all(
        torrents.map((torrent) => getStreams(torrent, baseUrl, season, episode))
      )
    ).flat();
  }

  console.log(`🔍 ${streamsWithScores.length} results for ${id} `);

  streamsWithScores.sort((a, b) => b.score - a.score);

  return { streams: streamsWithScores.map((stream) => stream.stream) };
};

export const getStreams = async (
  torrent: JackettResult,
  baseUrl: string,
  season?: string,
  episode?: string
): Promise<{ stream: Stremio.Stream; score: number }[]> => {
  const uri = torrent.torrent || torrent.magnet;
  if (!uri) return [];

  const torrentInfo = await getTorrentInfo(uri);
  if (!torrentInfo) return [];

  let videos = torrentInfo.files.filter((file) => isVideoFile(file.name));

  if (season && episode) {
    videos = videos.filter((file) =>
      isEpisodeNumberMatch(file.name, season, episode)
    );
  }

  const videosSize = videos.reduce((acc, file) => acc + file.size, 0);

  videos = videos.filter(
    (file) => file.size > videosSize / (videos.length + 1)
  );

  const subs = torrentInfo.files.filter(
    (file) =>
      file.name.toLowerCase().endsWith(".srt") ||
      file.name.toLowerCase().endsWith(".sub") ||
      file.name.toLowerCase().endsWith(".vtt")
  );

  const { quality, score } = guessQuality(torrent.name);
  const language = guessLanguage(torrent.name);

  return videos.map((file) => {
    const description = [
      ...(season && episode ? [torrent.name, file.name] : [torrent.name]),
      [
        `💾 ${getReadableSize(file.size)}`,
        `⬆️ ${torrent.seeds}`,
        `⬇️ ${torrent.peers}`,
      ].join(" "),
      [`🔊 ${language}`, `⚙️ ${torrent.tracker}`].join(" "),
    ].join("\n");

    const endpoint = `${baseUrl}/stream`;

    const url = [
      endpoint,
      encodeURIComponent(uri),
      encodeURIComponent(file.path),
    ].join("/");

    const subtitles = subs.map((sub, index) => ({
      id: index.toString(),
      url: [
        endpoint,
        encodeURIComponent(uri),
        encodeURIComponent(sub.path),
      ].join("/"),
      lang: sub.name,
    }));

    return {
      stream: {
        name: quality,
        description,
        url,
        subtitles,
      },
      score,
    };
  });
};

export const videoStreamHandler: Handler = async (req, res) => {
  const { torrentUri, filePath } = req.params;

  const torrent = await getOrAddTorrent(torrentUri);
  if (!torrent) return res.status(500).send("Failed to add torrent");

  updateAccessTime(torrent.infoHash);

  const file = getFile(torrent, filePath);
  if (!file) return res.status(404).send("File not found");

  let { range } = req.headers;
  if (!range) range = "bytes=0-";

  const positions = range.replace(/bytes=/, "").split("-");
  const start = Number(positions[0]);
  const end = Math.min(start + torrent.pieceLength, file.length - 1);

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${file.length}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": getStreamingMimeType(file.name),
  };

  res.writeHead(206, headers);

  try {
    const videoStream = file.createReadStream({ start, end });
    videoStream.on("error", () => {});
    videoStream.pipe(res);
  } catch (error) {
    res.status(500).end();
  }
};
