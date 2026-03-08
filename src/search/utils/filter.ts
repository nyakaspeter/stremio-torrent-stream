import { getSettings } from "../../config/settings.js";
import { TorrentFormat, type TorrentSearchResult } from "../../types/search.js";
import { guessQuality } from "./quality.js";
import { isTorrentNameMatch } from "./shows.js";

export const filterTorrents = async (
	torrents: TorrentSearchResult[],
	season?: number,
	episode?: number,
) => {
	const { disabledFormats } = await getSettings();

	let filteredTorrents = dedupeTorrents(torrents);

	filteredTorrents = filteredTorrents.filter((torrent) => {
		if (!torrent.seeds) return false;
		if (torrent.category?.includes("DVD")) return false;
		if (!isAllowedFormat(torrent.name, disabledFormats)) return false;

		if (
			season &&
			episode &&
			!isTorrentNameMatch(torrent.name, Number(season), Number(episode))
		)
			return false;

		return true;
	});

	filteredTorrents = filteredTorrents.sort(
		(a, b) => (b.seeds || 0) - (a.seeds || 0),
	);

	return filteredTorrents;
};

const dedupeTorrents = (torrents: TorrentSearchResult[]) => {
	const map = new Map(
		torrents.map((torrent) => [`${torrent.tracker}:${torrent.name}`, torrent]),
	);

	return [...map.values()];
};

const isAllowedFormat = (name: string, disabledFormats: string[]) => {
	const { quality } = guessQuality(name);

	if (
		disabledFormats.includes(TorrentFormat.HDR) &&
		(quality.includes("HDR") || quality.includes("Dolby Vision"))
	)
		return false;

	if (disabledFormats.includes(TorrentFormat.HEVC)) {
		const str = name.replace(/\W/g, "").toLowerCase();
		if (str.includes("x265") || str.includes("h265") || str.includes("hevc"))
			return false;
	}

	if (disabledFormats.includes(TorrentFormat["4K"]) && quality.includes("4K"))
		return false;

	if (
		disabledFormats.includes(TorrentFormat["1080p"]) &&
		quality.includes("1080p")
	)
		return false;

	if (
		disabledFormats.includes(TorrentFormat["720p"]) &&
		quality.includes("720p")
	)
		return false;

	if (
		disabledFormats.includes(TorrentFormat["SD / Other"]) &&
		!quality.includes("4K") &&
		!quality.includes("1080p") &&
		!quality.includes("720p")
	)
		return false;

	if (disabledFormats.includes(TorrentFormat.CAM) && quality.includes("CAM"))
		return false;

	if (disabledFormats.includes(TorrentFormat["3D"]) && quality.includes("3D"))
		return false;

	return true;
};
