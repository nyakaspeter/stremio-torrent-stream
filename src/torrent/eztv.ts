import axios from "axios";
import * as cheerio from "cheerio";
import { getTorrentsByImdbId } from "eztv-crawler";
import { TorrentSearchResult } from "./search.js";
import { isImdbId } from "../utils/imdb.js";

export const searchEztv = async (
  searchQuery: string
): Promise<TorrentSearchResult[]> => {
  try {
    if (isImdbId(searchQuery)) {
      const res = await getTorrentsByImdbId(searchQuery);

      return res.torrents.map((torrent) => ({
        name: torrent.title.replace("EZTV", "").trim(),
        tracker: "EZTV",
        category: parseCategory(torrent.title),
        size: Number(torrent.size_bytes),
        seeds: torrent.seeds,
        peers: torrent.peers,
        torrent: torrent.torrent_url,
        magnet: torrent.magnet_url,
      }));
    } else {
      const formData = new FormData();
      formData.append("layout", "def_wlinks");

      const eztvPage = await axios.post(
        `https://eztv.wf/search/${encodeURIComponent(searchQuery)}`,
        formData
      );
      const $ = cheerio.load(eztvPage.data);

      const results = $('[name="hover"]').toArray();

      return results.map((res) => {
        const title = $(res).find("td:nth-child(2)").text()?.replace(/\n/g, "");
        const size = $(res).find("td:nth-child(4)").text();
        const seeds = $(res).find("td:nth-child(6)").text();

        const torrent = $(res)
          .find("td:nth-child(3) .download_1")
          .attr("href")
          ?.replace(/\n/g, "");

        const magnet = $(res)
          .find("td:nth-child(3) .magnet")
          .attr("href")
          ?.replace(/\n/g, "");

        return {
          name: title.replace("[eztv]", "").trim(),
          tracker: "EZTV",
          category: parseCategory(title),
          size: parseSize(size),
          seeds: Number(seeds) || 0,
          peers: 0,
          torrent,
          magnet,
        };
      });
    }
  } catch (error) {
    return [];
  }
};

const parseCategory = (title: string) => {
  let quality = "SD";
  if (title.includes("720p")) quality = "720p";
  if (title.includes("1080p")) quality = "1080p";
  if (title.includes("2160p")) quality = "2160p";
  return `TV/${quality}`;
};

const parseSize = (size: string) => {
  const units: Record<string, number> = {
    TB: 1024 ** 4,
    GB: 1024 ** 3,
    MB: 1024 ** 2,
    KB: 1024,
    B: 1,
  };

  const [sizeStr, unit] = size.split(" ");
  const sizeNum = Number(sizeStr);

  if (!sizeNum || !units[unit]) return 0;

  return Math.ceil(sizeNum * units[unit]);
};
