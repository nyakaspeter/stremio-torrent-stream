export enum TorrentCategory {
	Movie = "movie",
	Show = "show",
}

export enum NcoreCategory {
	Film_SD_HU = "xvid_hun",
	Film_SD_EN = "xvid",
	Film_HD_HU = "hd_hun",
	Film_HD_EN = "hd",
	Sorozat_SD_HU = "xvidser_hun",
	Sorozat_SD_EN = "xvidser",
	Sorozat_HD_HU = "hdser_hun",
	Sorozat_HD_EN = "hdser",
}

export enum TorrentProvider {
	YTS = "yts",
	EZTV = "eztv",
	iTorrent = "itorrent",
	iNSANE = "insane",
	nCore = "ncore",
	Jackett = "jackett",
}

export type TorrentSearchResult = {
	name: string;
	tracker: string;
	category?: string;
	size?: number;
	seeds?: number;
	peers?: number;
	torrent?: string;
	magnet?: string;
};

export enum TorrentFormat {
	HDR = "hdr",
	HEVC = "hevc",
	"4K" = "4k",
	"1080p" = "1080p",
	"720p" = "720p",
	"SD / Other" = "sd",
	CAM = "cam",
	"3D" = "3d",
}
