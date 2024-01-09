import Stremio from "stremio-addon-sdk";
import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";
import { JackettResult, search } from "./jackett.js";
import {
  getReadableSize,
  guessLanguage,
  guessQuality,
  isEpisodeNumberMatch,
  isVideoFile,
} from "./utils.js";
import { getTorrentInfo } from "./webtorrent.js";

interface HandlerArgs {
  type: string;
  id: string;
}

export const streamHandler = async ({ type, id }: HandlerArgs) => {
  let streamsWithScores: { stream: Stremio.Stream; score: number }[] = [];

  if (type === "movie") {
    const torrents = await search(id, [JackettCategory.Movies]);
    torrents.filter((torrent) => !torrent.category?.includes("DVD"));
    torrents.filter((torrent) => torrent.seeds > 0);

    streamsWithScores = (
      await Promise.all(torrents.map((torrent) => getStreams(torrent)))
    ).flat();
  }

  if (type === "series") {
    const imdb = id.split(":")[0];
    const season = id.split(":")[1];
    const episode = id.split(":")[2];

    const torrents = await search(imdb, [JackettCategory.TV]);
    torrents.filter((torrent) => !torrent.category?.includes("DVD"));
    torrents.filter((torrent) => torrent.seeds > 0);

    streamsWithScores = (
      await Promise.all(
        torrents.map((torrent) => getStreams(torrent, season, episode))
      )
    ).flat();
  }

  console.log(`🔍 ${streamsWithScores.length} results for ${id} `);

  streamsWithScores.sort((a, b) => b.score - a.score);

  return { streams: streamsWithScores.map((stream) => stream.stream) };
};

const getStreams = async (
  torrent: JackettResult,
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

    const endpoint = "http://localhost:8000/stream";

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
