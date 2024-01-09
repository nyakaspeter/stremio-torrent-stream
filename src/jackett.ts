import { JackettApi } from "ts-jackett-api";
import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";

export interface JackettResult {
  name: string;
  tracker: string;
  category?: string;
  size: number;
  seeds: number;
  peers: number;
  torrent?: string;
  magnet?: string;
}

export const search = async (
  imdbId: string,
  categories: JackettCategory[],
  jackettUrl: string,
  jackettKey: string
): Promise<JackettResult[]> => {
  try {
    const client = new JackettApi(jackettUrl, jackettKey);

    const res = await client.search({
      query: imdbId,
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
    console.error(`Error: ${error}`);
    return [];
  }
};
