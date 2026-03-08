import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { NcoreCategory, type TorrentSearchResult } from "../../types/search.js";
import { isImdbId } from "../utils/imdb.js";

export const NCORE_MOVIE_CATEGORIES = [
	NcoreCategory.Film_SD_HU,
	NcoreCategory.Film_SD_EN,
	NcoreCategory.Film_HD_HU,
	NcoreCategory.Film_HD_EN,
];

export const NCORE_SHOW_CATEGORIES = [
	NcoreCategory.Sorozat_SD_HU,
	NcoreCategory.Sorozat_SD_EN,
	NcoreCategory.Sorozat_HD_HU,
	NcoreCategory.Sorozat_HD_EN,
];

export const searchNcoreTorrents = async (
	searchQuery: string,
	categories: NcoreCategory[],
	ncoreUsername?: string,
	ncorePassword?: string,
): Promise<TorrentSearchResult[]> => {
	try {
		if (!ncoreUsername || !ncorePassword) return [];

		const jar = new CookieJar();
		const client = wrapper(axios.create({ jar, baseURL: "https://ncore.pro" }));

		const formData = new FormData();
		formData.append("nev", ncoreUsername);
		formData.append("pass", ncorePassword);
		formData.append("set_lang", "hu");
		formData.append("submitted", "1");
		await client.post("/login.php", formData);

		const torrents: TorrentSearchResult[] = [];

		let page = 0;

		while (page <= 5) {
			try {
				page++;

				let torrentsOnPage = 0;

				const params = new URLSearchParams({
					oldal: page.toString(),
					tipus: "kivalasztottak_kozott",
					kivalasztott_tipus: categories.join(","),
					mire: searchQuery,
					miben: isImdbId(searchQuery) ? "imdb" : "name",
					miszerint: "ctime",
					hogyan: "DESC",
				});

				const link = `/torrents.php?${params.toString()}}`;
				const torrentsPage = await client.get(link);
				const $ = cheerio.load(torrentsPage.data);

				const rssUrl = $("link[rel=alternate]").attr("href");
				const downloadKey = rssUrl?.split("=")[1];
				if (!downloadKey) return torrents;

				for (const el of $("div.box_torrent")) {
					torrentsOnPage++;

					const name = $(el).find("div.torrent_txt > a").attr("title");

					const categoryHref = $(el)
						.find("a > img.categ_link")
						.parent()
						.attr("href");

					const tracker = "nCore";
					const category = parseCategory(categoryHref?.split("=")[1]);
					const size = parseSize($(el).find("div.box_meret2").text());
					const seeds = Number($(el).find("div.box_s2").text());
					const peers = Number($(el).find("div.box_l2").text());
					const torrentId = $(el).next().next().attr("id");
					const torrent = `https://ncore.pro/torrents.php?action=download&id=${torrentId}&key=${downloadKey}`;

					if (!name || !torrentId) continue;

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

				if (torrentsOnPage < 50) break;
			} catch {}
		}

		return torrents;
	} catch {
		return [];
	}
};

const parseCategory = (category: string | undefined) => {
	const categories: Record<NcoreCategory, string> = {
		[NcoreCategory.Film_SD_HU]: "Movies/SD/HU",
		[NcoreCategory.Film_SD_EN]: "Movies/SD/EN",
		[NcoreCategory.Film_HD_HU]: "Movies/HD/HU",
		[NcoreCategory.Film_HD_EN]: "Movies/HD/EN",
		[NcoreCategory.Sorozat_SD_HU]: "TV/SD/HU",
		[NcoreCategory.Sorozat_SD_EN]: "TV/SD/EN",
		[NcoreCategory.Sorozat_HD_HU]: "TV/HD/HU",
		[NcoreCategory.Sorozat_HD_EN]: "TV/HD/EN",
	};

	return categories[category as NcoreCategory];
};

const parseSize = (size: string) => {
	const units: Record<string, number> = {
		TiB: 1024 ** 4,
		GiB: 1024 ** 3,
		MiB: 1024 ** 2,
		KiB: 1024,
		B: 1,
	};

	const [sizeStr, unit] = size.split(" ");
	const sizeNum = Number(sizeStr);

	if (!sizeNum || !units[unit]) return 0;

	return Math.ceil(sizeNum * units[unit]);
};
