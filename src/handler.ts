import {
  TorrentCategory,
  TorrentSearchResult,
  TorrentSource,
  getStreams,
  searchTorrents,
} from "./torrents.js";
import { getTitles, guessQuality, isTorrentNameMatch } from "./utils.js";

interface HandlerArgs {
  type: string;
  id: string;
  config?: {
    streamServerUrl: string;
    enableJackett: string;
    jackettUrl: string;
    jackettKey: string;
    enableNcore: string;
    nCoreUser: string;
    nCorePassword: string;
    enableInsane: string;
    insaneUser: string;
    insanePassword: string;
    enableItorrent: string;
    enableYts: string;
    enableEztv: string;
    searchByTitle: string;
    disableHdr: string;
    disableHevc: string;
    disable4k: string;
    disableCam: string;
    disable3d: string;
  };
}

export const streamHandler = async ({ type, id, config }: HandlerArgs) => {
  if (!config?.streamServerUrl) return { streams: [] };

  let torrents: TorrentSearchResult[] = [];

  const categories: TorrentCategory[] = [];
  if (type === "movie") categories.push("movie");
  if (type === "series") categories.push("show");

  const sources: TorrentSource[] = [];
  if (config.enableJackett === "on") sources.push("jackett");
  if (config.enableNcore === "on") sources.push("ncore");
  if (config.enableInsane === "on") sources.push("insane");
  if (config.enableItorrent === "on") sources.push("itorrent");
  if (config.enableYts === "on") sources.push("yts");
  if (config.enableEztv === "on") sources.push("eztv");

  const [imdbId, season, episode] = id.split(":");

  const queries = [imdbId];
  if (config.searchByTitle === "on") queries.push(...(await getTitles(imdbId)));

  torrents = (
    await Promise.all(
      queries.map((query) =>
        searchTorrents(config.streamServerUrl, query, {
          categories,
          sources,
          jackett: {
            url: config.jackettUrl,
            apiKey: config.jackettKey,
          },
          ncore: {
            user: config.nCoreUser,
            password: config.nCorePassword,
          },
          insane: {
            user: config.insaneUser,
            password: config.insanePassword,
          },
        })
      )
    )
  ).flat();

  torrents = dedupeTorrents(torrents);

  torrents = torrents.filter((torrent) => {
    if (!torrent.seeds) return false;
    if (torrent.category?.includes("DVD")) return false;
    if (!isAllowedFormat(config, torrent.name)) return false;
    if (!isAllowedQuality(config, guessQuality(torrent.name).quality))
      return false;

    if (
      season &&
      episode &&
      !isTorrentNameMatch(torrent.name, Number(season), Number(episode))
    )
      return false;

    return true;
  });

  let streams = (
    await Promise.all(
      torrents.map((torrent) =>
        getStreams(config.streamServerUrl, torrent, season, episode)
      )
    )
  ).flat();

  streams = streams.filter((stream) => {
    if (!isAllowedFormat(config, stream.fileName)) return false;
    if (!isAllowedQuality(config, stream.quality)) return false;
    return true;
  });

  streams.sort((a, b) => b.score - a.score);

  console.log(`🔍 ${streams.length} results for ${id} `);

  return { streams: streams.map((stream) => stream.stream) };
};

const isAllowedQuality = (config: HandlerArgs["config"], quality: string) => {
  if (config?.disable4k === "on" && quality.includes("4K")) return false;

  if (config?.disableCam === "on" && quality.includes("CAM")) return false;

  if (
    config?.disableHdr === "on" &&
    (quality.includes("HDR") || quality.includes("Dolby Vision"))
  )
    return false;

  if (config?.disable3d === "on" && quality.includes("3D")) return false;

  return true;
};

const isAllowedFormat = (config: HandlerArgs["config"], name: string) => {
  if (config?.disableHevc === "on") {
    const str = name.replace(/\W/g, "").toLowerCase();
    if (str.includes("x265") || str.includes("h265") || str.includes("hevc"))
      return false;
  }

  return true;
};

const dedupeTorrents = (torrents: TorrentSearchResult[]) => {
  const map = new Map(
    torrents.map((torrent) => [`${torrent.tracker}:${torrent.name}`, torrent])
  );

  return [...map.values()];
};
