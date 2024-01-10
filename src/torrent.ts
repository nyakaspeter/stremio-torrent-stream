import axios from "axios";
import Stremio from "stremio-addon-sdk";
import { JackettResult } from "./jackett.js";
import {
  getReadableSize,
  guessLanguage,
  guessQuality,
  isEpisodeNumberMatch,
  isVideoFile,
} from "./utils.js";

interface TorrentInfo {
  name: string;
  infoHash: string;
  size: number;
  files: {
    name: string;
    path: string;
    size: number;
  }[];
}

const getTorrentInfo = async (streamServerUrl: string, uri: string) => {
  try {
    return (
      await axios.get<TorrentInfo>(
        `${streamServerUrl}/torrent/${encodeURIComponent(uri)}`
      )
    ).data;
  } catch {
    return undefined;
  }
};

export const getStreams = async (
  streamServerUrl: string,
  torrent: JackettResult,
  season?: string,
  episode?: string
): Promise<{ stream: Stremio.Stream; score: number }[]> => {
  const uri = torrent.torrent || torrent.magnet;
  if (!uri) return [];

  const torrentInfo = await getTorrentInfo(streamServerUrl, uri);
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

    const endpoint = `${streamServerUrl}/stream`;

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
