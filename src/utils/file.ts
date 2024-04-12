import mime from "mime";

export const isVideoFile = (filename: string) =>
  mime.getType(filename)?.startsWith("video") || false;

export const isSubtitleFile = (filename: string) =>
  filename.toLowerCase().endsWith(".srt") ||
  filename.toLowerCase().endsWith(".sub") ||
  filename.toLowerCase().endsWith(".vtt") ||
  filename.toLowerCase().endsWith(".smi") ||
  filename.toLowerCase().endsWith(".ssa") ||
  filename.toLowerCase().endsWith(".ass") ||
  filename.toLowerCase().endsWith(".txt");

export const getStreamingMimeType = (filename: string) => {
  const mimeType = mime.getType(filename);
  return mimeType?.startsWith("video")
    ? "video/mp4"
    : mimeType || "application/unknown";
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

export const getReadableDuration = (millisecs: number) => {
  var seconds = (millisecs / 1000).toFixed(1);
  var minutes = (millisecs / (1000 * 60)).toFixed(1);
  var hours = (millisecs / (1000 * 60 * 60)).toFixed(1);
  var days = (millisecs / (1000 * 60 * 60 * 24)).toFixed(1);

  if (Number(seconds) < 60) {
    return seconds + " seconds";
  } else if (Number(minutes) < 60) {
    return minutes + " minutes";
  } else if (Number(hours) < 24) {
    return hours + " hours";
  } else {
    return days + " days";
  }
};
