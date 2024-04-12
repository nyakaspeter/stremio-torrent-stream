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
