import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { TorrentSearchResult } from "./search.js";

const INSANE_USER = process.env.INSANE_USER;
const INSANE_PASSWORD = process.env.INSANE_PASSWORD;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";

export enum InsaneCategory {
  Film_Hun_SD = 41,
  Film_Hun_HD = 27,
  Film_Hun_UHD = 44,
  Film_Eng_SD = 42,
  Film_Eng_HD = 25,
  Film_Eng_UHD = 45,
  Sorozat_Hun = 8,
  Sorozat_Hun_HD = 40,
  Sorozat_Hun_UHD = 47,
  Sorozat_Eng = 7,
  Sorozat_Eng_HD = 39,
  Sorozat_Eng_UHD = 46,
}

export const searchInsane = async (
  searchQuery: string,
  categories: InsaneCategory[],
  insaneUser?: string,
  insanePassword?: string
): Promise<TorrentSearchResult[]> => {
  try {
    const user = insaneUser || INSANE_USER;
    const password = insanePassword || INSANE_PASSWORD;

    if (!user || !password) return [];

    const jar = new CookieJar();

    const client = wrapper(
      // @ts-ignore
      axios.create({
        // @ts-ignore
        jar,
        baseURL: "https://newinsane.info",
        headers: { "User-Agent": USER_AGENT },
      })
    );

    const formData = new FormData();
    formData.append("username", user);
    formData.append("password", password);
    await client.post("/login.php", formData);

    const torrents: TorrentSearchResult[] = [];

    let page = 0;

    while (page <= 5) {
      try {
        let torrentsOnPage = 0;

        let params = new URLSearchParams({
          page: page.toString(),
          search: searchQuery,
          searchsort: "normal",
          searchtype: "desc",
          torart: "tor",
        });

        for (const category of categories) {
          params.append("cat[]", category.toString());
        }

        const link = `/browse.php?${params.toString()}}`;
        const torrentsPage = await client.get(link);
        const $ = cheerio.load(torrentsPage.data);

        for (const el of $("tr.torrentrow")) {
          torrentsOnPage++;

          const tracker = "iNSANE";
          const name = $(el).find("a.torrentname").attr("title");
          const category = parseCategory(
            $(el).find("td.caticon > a > img").attr("title")
          );
          const size = parseSize($(el).find("td.size").text());
          const seeds = Number($(el).find("td.data > a:nth-of-type(1)").text());
          const peers = Number($(el).find("td.data > a:nth-of-type(2)").text());
          const torrent = $(el).find("a.downloadicon").attr("href");

          if (!name || !torrent) continue;

          torrents.push({
            name,
            tracker,
            category,
            size,
            seeds,
            peers,
            torrent,
          });
        }

        if (torrentsOnPage < 25) break;

        page++;
      } catch {
        continue;
      }
    }

    return torrents;
  } catch (error) {
    return [];
  }
};

const parseCategory = (category: string | undefined) => {
  const categories: Record<string, string> = {
    "Film/Hun/SD": "Movies/SD/HU",
    "Film/Hun/HD": "Movies/HD/HU",
    "Film/Hun/UHD": "Movies/UHD/HU",
    "Film/Eng/SD": "Movies/SD/EN",
    "Film/Eng/HD": "Movies/HD/EN",
    "Film/Eng/UHD": "Movies/UHD/EN",
    "Sorozat/Hun": "TV/SD/HU",
    "Sorozat/Hun/HD": "TV/HD/HU",
    "Sorozat/Hun/UHD": "TV/UHD/HU",
    "Sorozat/Eng": "TV/SD/EN",
    "Sorozat/Eng/HD": "TV/HD/EN",
    "Sorozat/Eng/UHD": "TV/UHD/EN",
  };

  return categories[category as string];
};

const parseSize = (sizeStr: string) => {
  const size = sizeStr.replace(",", ".").trim();
  let bytes = 0;
  if (size.endsWith("TiB"))
    bytes = (Number(size.replace("TiB", "")) || 0) * 1024 ** 4;
  else if (size.endsWith("GiB"))
    bytes = (Number(size.replace("GiB", "")) || 0) * 1024 ** 3;
  else if (size.endsWith("MiB"))
    bytes = (Number(size.replace("MiB", "")) || 0) * 1024 ** 2;
  else if (size.endsWith("KiB"))
    bytes = (Number(size.replace("KiB", "")) || 0) * 1024;
  else if (size.endsWith("B")) bytes = Number(size.replace("B", "")) || 0;

  return Math.ceil(bytes);
};
