import axios from "axios";
import * as cheerio from "cheerio";
import { TorrentSearchResult } from "./search.js";

export enum ItorrentCategory {
  Film = 3,
  Sorozat = 4,
}

export enum ItorrentQuality {
  SD = "sd",
  HD = "hd",
  CAM = "cam",
}

export const searchItorrent = async (
  searchQuery: string,
  categories: ItorrentCategory[],
  qualities: ItorrentQuality[]
): Promise<TorrentSearchResult[]> => {
  const torrents: TorrentSearchResult[] = [];
  const quality = qualities.join(",");

  await Promise.all(
    categories.map(async (category) => {
      let page = 0;

      while (page <= 5) {
        try {
          page++;

          let torrentsOnPage = 0;

          const link = `https://itorrent.ws/torrentek/category/${category}/title/${searchQuery}/qualities[]/${quality}/page/${page}/`;
          const torrentsPage = await axios.get(link);
          const $ = cheerio.load(torrentsPage.data);

          await Promise.all(
            [...$("tr.gradeX")].map(async (el) => {
              torrentsOnPage++;

              const tracker = "iTorrent";
              const torrentAnchor = $(el).find("td.ellipse > a");
              const torrentHref = torrentAnchor.attr("href");
              const name = torrentAnchor.text().trim();

              if (!torrentHref || !name) return;

              const category = parseCategory($(el).find("i.zqf").attr("title"));
              const size = parseSize(
                $(el).find("td:nth-child(5)").text().trim()
              );
              const seeds = Number($(el).find("td:nth-child(7)").text());
              const peers = Number($(el).find("td:nth-child(8)").text());

              const torrentPageLink = `https://itorrent.ws${torrentHref}`;

              let torrent: string | undefined;
              let magnet: string | undefined;

              try {
                const torrentPage = await axios.get(torrentPageLink);
                const $ = cheerio.load(torrentPage.data);

                const torrentFileHref = $("a.btn-primary.seed-warning").attr(
                  "href"
                );

                if (torrentFileHref)
                  torrent = `https://itorrent.ws${torrentFileHref}`;

                magnet = $("a.btn-success.seed-warning").attr("href");

                if (!torrent && !magnet) return;
              } catch {
                return;
              }

              torrents.push({
                name,
                tracker,
                category,
                size,
                seeds,
                peers,
                torrent,
                magnet,
              });
            })
          );

          if (torrentsOnPage < 48) break;
        } catch {
          continue;
        }
      }
    })
  );

  return torrents;
};

const parseCategory = (category: string | undefined) => {
  const categories: Record<string, string> = {
    "Film/HU/CAM": "Movies/CAM/HU",
    "Film/HU/SD": "Movies/SD/HU",
    "Film/HU/HD": "Movies/HD/HU",
    "Sorozat/HU/SD": "TV/SD/HU",
    "Sorozat/HU/HD": "TV/HD/HU",
  };

  return categories[category as string];
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
