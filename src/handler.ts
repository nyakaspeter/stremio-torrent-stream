import Stremio from "stremio-addon-sdk";
import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";
import { searchJackett } from "./jackett.js";
import { getStreams } from "./torrent.js";

interface HandlerArgs {
  type: string;
  id: string;
  config?: {
    jackettUrl: string;
    jackettKey: string;
    streamServerUrl: string;
  };
}

export const streamHandler = async ({ type, id, config }: HandlerArgs) => {
  const { jackettUrl, jackettKey, streamServerUrl } = config || {};

  if (!jackettUrl || !jackettKey || !streamServerUrl) {
    return { streams: [] };
  }

  let streamsWithScores: { stream: Stremio.Stream; score: number }[] = [];

  if (type === "movie") {
    const torrents = await searchJackett(jackettUrl, jackettKey, id, [
      JackettCategory.Movies,
    ]);

    torrents.filter((torrent) => !torrent.category?.includes("DVD"));
    torrents.filter((torrent) => torrent.seeds > 0);

    streamsWithScores = (
      await Promise.all(
        torrents.map((torrent) => getStreams(streamServerUrl, torrent))
      )
    ).flat();
  }

  if (type === "series") {
    const imdb = id.split(":")[0];
    const season = id.split(":")[1];
    const episode = id.split(":")[2];

    const torrents = await searchJackett(jackettUrl, jackettKey, imdb, [
      JackettCategory.TV,
    ]);

    torrents.filter((torrent) => !torrent.category?.includes("DVD"));
    torrents.filter((torrent) => torrent.seeds > 0);

    streamsWithScores = (
      await Promise.all(
        torrents.map((torrent) =>
          getStreams(streamServerUrl, torrent, season, episode)
        )
      )
    ).flat();
  }

  console.log(`🔍 ${streamsWithScores.length} results for ${id} `);

  streamsWithScores.sort((a, b) => b.score - a.score);

  return { streams: streamsWithScores.map((stream) => stream.stream) };
};
