import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";
import { searchEztv } from "./eztv.js";
import {
  ItorrentCategory,
  ItorrentQuality,
  searchItorrent,
} from "./itorrent.js";
import { searchJackett } from "./jackett.js";
import { NcoreCategory, searchNcore } from "./ncore.js";
import { searchYts } from "./yts.js";
import { InsaneCategory, searchInsane } from "./insane.js";

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

export const searchTorrents = async (
  query: string,
  options?: TorrentSearchOptions
) => {
  const searchAllCategories = !options?.categories?.length;
  const searchAllSources = !options?.sources?.length;

  const promises: Promise<TorrentSearchResult[]>[] = [];

  if (options?.sources?.includes("jackett") || searchAllSources) {
    const categories = new Set<JackettCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(JackettCategory.Movies);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(JackettCategory.TV);
    }

    promises.push(
      searchJackett(
        query,
        Array.from(categories),
        options?.jackett?.url,
        options?.jackett?.apiKey
      )
    );
  }

  if (options?.sources?.includes("ncore") || searchAllSources) {
    const categories = new Set<NcoreCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(NcoreCategory.Film_HD_HU);
      categories.add(NcoreCategory.Film_HD_EN);
      categories.add(NcoreCategory.Film_SD_HU);
      categories.add(NcoreCategory.Film_SD_EN);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(NcoreCategory.Sorozat_HD_HU);
      categories.add(NcoreCategory.Sorozat_HD_EN);
      categories.add(NcoreCategory.Sorozat_SD_HU);
      categories.add(NcoreCategory.Sorozat_SD_EN);
    }

    promises.push(
      searchNcore(
        query,
        Array.from(categories),
        options?.ncore?.user,
        options?.ncore?.password
      )
    );
  }

  if (options?.sources?.includes("insane") || searchAllSources) {
    const categories = new Set<InsaneCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(InsaneCategory.Film_Hun_SD);
      categories.add(InsaneCategory.Film_Hun_HD);
      categories.add(InsaneCategory.Film_Hun_UHD);
      categories.add(InsaneCategory.Film_Eng_SD);
      categories.add(InsaneCategory.Film_Eng_HD);
      categories.add(InsaneCategory.Film_Eng_UHD);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(InsaneCategory.Sorozat_Hun);
      categories.add(InsaneCategory.Sorozat_Hun_HD);
      categories.add(InsaneCategory.Sorozat_Hun_UHD);
      categories.add(InsaneCategory.Sorozat_Eng);
      categories.add(InsaneCategory.Sorozat_Eng_HD);
      categories.add(InsaneCategory.Sorozat_Eng_UHD);
    }

    promises.push(
      searchInsane(
        query,
        Array.from(categories),
        options?.insane?.user,
        options?.insane?.password
      )
    );
  }

  if (options?.sources?.includes("itorrent") || searchAllSources) {
    const categories = new Set<ItorrentCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(ItorrentCategory.Film);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(ItorrentCategory.Sorozat);
    }

    const qualities = [
      ItorrentQuality.HD,
      ItorrentQuality.SD,
      ItorrentQuality.CAM,
    ];

    promises.push(searchItorrent(query, Array.from(categories), qualities));
  }

  if (options?.sources?.includes("yts") || searchAllSources) {
    if (options?.categories?.includes("movie") || searchAllCategories) {
      promises.push(searchYts(query));
    }
  }

  if (options?.sources?.includes("eztv") || searchAllSources) {
    if (options?.categories?.includes("show") || searchAllCategories) {
      promises.push(searchEztv(query));
    }
  }

  const results = (await Promise.all(promises)).flat();

  console.log(`Search: got ${results.length} results for ${query}`);

  return results;
};
