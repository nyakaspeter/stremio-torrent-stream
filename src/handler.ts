import {
  TorrentCategory,
  TorrentSearchResult,
  TorrentSource,
  getStreams,
  searchTorrents,
} from "./torrents.js";
import {
  dedupeTorrents,
  getTitles,
  guessQuality,
  isSeasonNumberMatch,
} from "./utils.js";

interface HandlerArgs {
  type: string;
  id: string;
  config?: {
    streamServerUrl: string;
    enableJackett: string;
    jackettUrl: string;
    jackettKey: string;
    searchByTitle: string;
    disableHdr: string;
    disableHevc: string;
    disable4k: string;
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
        })
      )
    )
  ).flat();

  torrents = dedupeTorrents(torrents);

  torrents = torrents.filter((torrent) => {
    if (!torrent.seeds) return false;
    if (torrent.category?.includes("DVD")) return false;
    if (season && !isSeasonNumberMatch(torrent.name, season)) return false;

    const { quality } = guessQuality(torrent.name);

    if (config.disable4k === "on" && quality.includes("4K")) return false;

    if (
      (config.disableHdr === "on" && quality.includes("HDR")) ||
      quality.includes("Dolby Vision")
    )
      return false;

    if (config.disable3d === "on" && quality.includes("3D")) return false;

    if (config.disableHevc === "on") {
      const str = torrent.name.replace(/\W/g, "").toLowerCase();
      if (str.includes("x265") || str.includes("h265") || str.includes("hevc"))
        return false;
    }

    return true;
  });

  const streamsWithScores = (
    await Promise.all(
      torrents.map((torrent) =>
        getStreams(config.streamServerUrl, torrent, season, episode)
      )
    )
  ).flat();

  console.log(`🔍 ${streamsWithScores.length} results for ${id} `);

  streamsWithScores.sort((a, b) => b.score - a.score);

  return { streams: streamsWithScores.map((stream) => stream.stream) };
};
