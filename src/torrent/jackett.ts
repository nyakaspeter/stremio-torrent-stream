import { JackettApi } from "ts-jackett-api";
import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";
import { TorrentSearchResult } from "./search.js";

const JACKETT_URL = process.env.JACKETT_URL;
const JACKETT_KEY = process.env.JACKETT_KEY;

export const searchJackett = async (
  searchQuery: string,
  categories: JackettCategory[],
  jackettUrl?: string,
  jackettKey?: string
): Promise<TorrentSearchResult[]> => {
  try {
    const url = jackettUrl || JACKETT_URL;
    const key = jackettKey || JACKETT_KEY;

    if (!url || !key) return [];

    const client = new JackettApi(url, key);

    const res = await client.search({
      query: searchQuery,
      category: categories,
    });

    return res.Results.map((result) => ({
      name: result.Title,
      tracker: result.Tracker,
      category: result.CategoryDesc || undefined,
      size: result.Size,
      seeds: result.Seeders,
      peers: result.Peers,
      torrent: result.Link || undefined,
      magnet: result.MagnetUri || undefined,
    }));
  } catch (error) {
    return [];
  }
};
