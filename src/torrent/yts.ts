import { details, search } from "yts-api-node";
import { TorrentSearchResult } from "./search.js";
import { isImdbId } from "../utils/imdb.js";

const trackers = [
  "udp://glotorrents.pw:6969/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://torrent.gresille.org:80/announce",
  "udp://tracker.openbittorrent.com:80",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://tracker.leechers-paradise.org:6969",
  "udp://p4p.arenabg.ch:1337",
  "udp://tracker.internetwarriors.net:1337",
];

const trackersString = "&tr=" + trackers.join("&tr=");

export const searchYts = async (
  searchQuery: string
): Promise<TorrentSearchResult[]> => {
  try {
    if (isImdbId(searchQuery)) {
      const res = await details({ movie_id: searchQuery });

      return res.data.movie.torrents.map((torrent) => ({
        name: `${res.data.movie.title_long} ${torrent.quality} ${torrent.type
          .replace("bluray", "BluRay")
          .replace("web", "WEB")}`,
        tracker: "YTS",
        category: `Movies/${torrent.quality}`,
        size: torrent.size_bytes,
        seeds: torrent.seeds,
        peers: torrent.peers,
        torrent: torrent.url,
        magnet: `magnet:?xt=urn:btih:${torrent.hash}${trackersString}`,
      }));
    } else {
      const res = await search({ query_term: searchQuery });

      return res.data.movies.flatMap((movie) =>
        movie.torrents.map((torrent) => ({
          name: `${movie.title_long} ${torrent.quality} ${torrent.type
            .replace("bluray", "BluRay")
            .replace("web", "WEB")}`,
          tracker: "YTS",
          category: `Movies/${torrent.quality}`,
          size: torrent.size_bytes,
          seeds: torrent.seeds,
          peers: torrent.peers,
          torrent: torrent.url,
          magnet: `magnet:?xt=urn:btih:${torrent.hash}${trackersString}`,
        }))
      );
    }
  } catch (error) {
    return [];
  }
};
