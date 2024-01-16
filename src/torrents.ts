import axios from "axios";
import Stremio from "stremio-addon-sdk";
import {
  getReadableSize,
  guessLanguage,
  guessQuality,
  isFileNameMatch,
  isVideoFile,
} from "./utils.js";

export type TorrentCategory = "movie" | "show";

export type TorrentSource =
  | "jackett"
  | "ncore"
  | "insane"
  | "itorrent"
  | "yts"
  | "eztv";

export interface TorrentSearchOptions {
  categories?: TorrentCategory[];
  sources?: TorrentSource[];
  jackett?: {
    url?: string;
    apiKey?: string;
  };
  ncore?: {
    user?: string;
    password?: string;
  };
  insane?: {
    user?: string;
    password?: string;
  };
}

export interface TorrentSearchResult {
  name: string;
  tracker: string;
  category?: string;
  size?: number;
  seeds?: number;
  peers?: number;
  torrent?: string;
  magnet?: string;
}

export interface TorrentInfo {
  name: string;
  infoHash: string;
  size: number;
  files: {
    name: string;
    path: string;
    size: number;
  }[];
}

export const searchTorrents = async (
  streamServerUrl: string,
  query: string,
  options: TorrentSearchOptions
) => {
  try {
    return (
      await axios.post<TorrentSearchResult[]>(
        `${streamServerUrl}/torrents/${encodeURIComponent(query)}`,
        options
      )
    ).data;
  } catch {
    return [];
  }
};

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
  torrent: TorrentSearchResult,
  season?: string,
  episode?: string
): Promise<
  {
    stream: Stremio.Stream;
    torrentName: string;
    fileName: string;
    quality: string;
    score: number;
  }[]
> => {
  const uri = torrent.torrent || torrent.magnet;
  if (!uri) return [];

  const torrentInfo = await getTorrentInfo(streamServerUrl, uri);
  if (!torrentInfo) return [];

  let videos = torrentInfo.files.filter((file) => isVideoFile(file.name));

  if (season && episode) {
    videos = videos.filter((file) =>
      isFileNameMatch(file.name, Number(season), Number(episode))
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

  const torrentQuality = guessQuality(torrent.name);
  const language = guessLanguage(torrent.name, torrent.category);

  return videos.map((file) => {
    const fileQuality = guessQuality(file.name);

    const { quality, score } =
      fileQuality.score > torrentQuality.score ? fileQuality : torrentQuality;

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
      torrentName: torrent.name,
      fileName: file.name,
      quality,
      score,
    };
  });
};
