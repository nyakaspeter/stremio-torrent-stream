import axios from "axios";

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

export const isImdbId = (str: string) =>
  /ev\d{7}\/\d{4}(-\d)?|(ch|co|ev|nm|tt)\d{7}/.test(str);
