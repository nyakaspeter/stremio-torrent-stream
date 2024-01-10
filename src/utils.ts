import mime from "mime";

export const isVideoFile = (filename: string) =>
  mime.getType(filename)?.startsWith("video") || false;

export const isEpisodeNumberMatch = (
  title: string,
  season: string,
  episode: string
) => {
  const lowerTitle = title.toLowerCase();

  return (
    lowerTitle.includes(
      `s${season.padStart(2, "0")}e${episode.padStart(2, "0")}`
    ) ||
    lowerTitle.includes(`${season}x${episode.padStart(2, "0")}`) ||
    lowerTitle.includes(`s${season.padStart(2, "0")}-`) ||
    lowerTitle.includes(`-s${season.padStart(2, "0")}`) ||
    lowerTitle.includes("complete")
  );
};

export const guessLanguage = (title: string) => {
  const split = title
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

export const guessQuality = (title: string) => {
  const str = title.replace(/\W/g, " ").toLowerCase();

  let score = 0;
  const parts = [];

  if (str.includes("2160p")) {
    parts.push("4K");
    score += 3000;
  } else if (str.includes("1080p")) {
    parts.push("1080p");
    score += 2000;
  } else if (str.includes("720p")) {
    parts.push("720p");
    score += 1000;
  }

  if (
    str.includes("dolby vision") ||
    str.includes("dovi") ||
    str.includes(" dv ")
  ) {
    parts.push("Dolby Vision");
    score += 20;
  } else if (str.includes("hdr")) {
    parts.push("HDR");
    score += 10;
  }

  if (
    str.includes("bluray") ||
    str.includes("blu ray") ||
    str.includes("bdrip") ||
    str.includes("brrip")
  ) {
    parts.push("BluRay");
    score += 500;

    if (str.includes("remux")) {
      parts.push("Remux");
      score += 100;
    }
  } else if (
    str.includes("webrip") ||
    str.includes("webdl") ||
    str.includes(" web ")
  ) {
    parts.push("WEB");
    score += 400;
  } else if (str.includes("dvdrip")) {
    parts.push("DVD");
    score += 300;
  } else if (str.includes("hdtv")) {
    parts.push("HDTV");
    score += 200;
  } else if (str.includes("sdtv")) {
    parts.push("sdtv");
    score += 100;
  }

  if (str.includes("3d")) {
    parts.push("3D");
    score -= 1;
  }

  if (parts.length === 0) parts.push("Unknown");

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
