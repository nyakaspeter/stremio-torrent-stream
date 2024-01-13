import axios from "axios";
import mime from "mime";

export const isVideoFile = (filename: string) =>
  mime.getType(filename)?.startsWith("video") || false;

export const isTorrentNameMatch = (
  name: string,
  season: number,
  episode: number
) => {
  const guess = guessSeasonEpisode(name);
  if (guess.completeSeries) return true;
  if (guess.seasons?.includes(season)) return true;
  if (guess.season === season && guess.episode === episode) return true;
  if (season === 0) {
    if (name.toLowerCase().includes("special")) return true;
    if (guess.season === undefined && guess.seasons === undefined) return true;
  }
  return false;
};

export const isFileNameMatch = (
  name: string,
  season: number,
  episode: number
) => {
  const guess = guessSeasonEpisode(name);
  if (guess.season === season && guess.episode === episode) return true;
  if (season === 0) return true;
  return false;
};

export const getTitle = async (imdbId: string, language?: string) => {
  try {
    const data = (
      await axios.get(`https://www.imdb.com/title/${imdbId}`, {
        headers: {
          "Accept-Language": language,
          "Accept-Encoding": "gzip,deflate,compress",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      })
    ).data;

    const title = data.match(/<title>(.*?)<\/title>/)[1] as string;
    if (!title) return undefined;
    return title.split(" (")[0];
  } catch {
    return undefined;
  }
};

export const getTitles = async (imdbId: string) => {
  const titles = new Set<string>();

  (await Promise.all([getTitle(imdbId), getTitle(imdbId, "en")])).forEach(
    (title) => {
      if (title) titles.add(title);
    }
  );

  return [...titles];
};

export const guessSeasonEpisode = (name: string) => {
  const str = name.replace(/\W/g, " ").toLowerCase();

  const seasonMatch = [...str.matchAll(/[s](?<season>\d+)/g)];
  const episodeMatch = str.match(/[e](?<episode>\d+)/);

  if (seasonMatch.length === 0 && str.includes("complete")) {
    return { completeSeries: true };
  } else if (seasonMatch.length === 1 && !episodeMatch) {
    const season = Number(seasonMatch[0].groups?.season) || 0;
    return { seasons: [season] };
  } else if (seasonMatch.length > 1) {
    const firstSeason = Number(seasonMatch[0].groups?.season) || 0;
    const lastSeason =
      Number(seasonMatch[seasonMatch.length - 1].groups?.season) || 0;
    const seasons = [];
    for (let i = firstSeason; i <= lastSeason; i++) seasons.push(i);
    return { seasons };
  } else if (seasonMatch[0] || episodeMatch) {
    const season = Number(seasonMatch[0]?.groups?.season) || undefined;
    const episode = Number(episodeMatch?.groups?.episode) || undefined;
    return { season, episode };
  } else {
    const seasonEpisodeMatch = str.match(/(?<season>\d+)x(?<episode>\d+)/);
    const season = Number(seasonEpisodeMatch?.groups?.season) || undefined;
    const episode = Number(seasonEpisodeMatch?.groups?.episode) || undefined;
    return { season, episode };
  }
};

export const guessLanguage = (name: string, category?: string) => {
  if (category?.includes("HU")) return "Hungarian";

  const split = name
    .toLowerCase()
    .replace(/\W/g, " ")
    .replace("x", " ")
    .split(" ");

  if (split.includes("hun") || split.includes("hungarian")) return "Hungarian";
  if (split.includes("ger") || split.includes("german")) return "German";
  if (split.includes("fre") || split.includes("french")) return "French";
  if (split.includes("ita") || split.includes("italian")) return "Italian";

  return "English";
};

export const guessQuality = (name: string) => {
  const split = name.replace(/\W/g, " ").toLowerCase().split(" ");

  let score = 0;
  const parts = [];

  if (split.includes("2160p")) {
    parts.push("4K");
    score += 3000;
  } else if (split.includes("1080p")) {
    parts.push("1080p");
    score += 2000;
  } else if (split.includes("720p")) {
    parts.push("720p");
    score += 1000;
  }

  if (
    (split.includes("dolby") && split.includes("vision")) ||
    split.includes("dovi") ||
    split.includes("dv")
  ) {
    parts.push("Dolby Vision");
    score += 20;
  } else if (split.includes("hdr")) {
    parts.push("HDR");
    score += 10;
  }

  if (
    split.includes("bluray") ||
    (split.includes("blu") && split.includes("ray")) ||
    split.includes("bdrip") ||
    split.includes("brrip")
  ) {
    parts.push("BluRay");
    score += 500;

    if (split.includes("remux")) {
      parts.push("Remux");
      score += 100;
    }
  } else if (
    split.includes("webrip") ||
    split.includes("webdl") ||
    split.includes("web")
  ) {
    parts.push("WEB");
    score += 400;
  } else if (split.includes("dvdrip")) {
    parts.push("DVD");
    score += 300;
  } else if (split.includes("hdtv")) {
    parts.push("HDTV");
    score += 200;
  } else if (split.includes("sdtv")) {
    parts.push("sdtv");
    score += 100;
  } else if (
    split.includes("camrip") ||
    split.includes("cam") ||
    split.includes("hdcam") ||
    split.includes("ts") ||
    split.includes("hdts") ||
    split.includes("tc") ||
    split.includes("hdtc")
  ) {
    parts.push("CAM");
    score -= 5000;
  }

  if (split.includes("3d")) {
    parts.push("3D");
    score -= 1;
  }

  if (parts.length === 0) {
    parts.push("Unknown");
    score = -Infinity;
  }

  return { quality: parts.join(" "), score };
};

export const getReadableSize = (bytes: number) => {
  if (bytes == 0) {
    return "0.00 B";
  }
  var e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, e)).toFixed(2) + " " + " KMGTP".charAt(e) + "B"
  );
};
