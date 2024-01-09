import WebTorrent, { Torrent } from "webtorrent";
import { CronJob } from "cron";
// @ts-ignore
import MemoryStore from "memory-chunk-store";

interface TorrentInfo {
  name: string;
  infoHash: string;
  size: number;
  files: {
    name: string;
    path: string;
    size: number;
  }[];
}

const infoClient = new WebTorrent();
const streamClient = new WebTorrent();

streamClient.on("torrent", (torrent) => {
  console.log(`➕ ${torrent.name}`);
});

streamClient.on("error", (error) => {
  if (typeof error === "string") {
    console.error(`Error: ${error}`);
  } else {
    if (error.message.startsWith("Cannot add duplicate torrent")) return;
    console.error(`Error: ${error.message}`);
  }
});

export const getOrAddTorrent = (uri: string) =>
  new Promise<Torrent | undefined>((resolve) => {
    const torrent = streamClient.add(
      uri,
      { destroyStoreOnDestroy: true },
      (torrent) => {
        clearTimeout(timeout);
        resolve(torrent);
      }
    );

    const timeout = setTimeout(() => {
      torrent.destroy();
      resolve(undefined);
    }, 5000);
  });

export const getFile = (torrent: Torrent, path: string) =>
  torrent.files.find((file) => file.path === path);

export const getTorrentInfo = async (uri: string) => {
  const getInfo = (torrent: Torrent): TorrentInfo => ({
    name: torrent.name,
    infoHash: torrent.infoHash,
    size: torrent.length,
    files: torrent.files.map((file) => ({
      name: file.name,
      path: file.path,
      size: file.length,
    })),
  });

  return await new Promise<TorrentInfo | undefined>((resolve) => {
    const torrent = infoClient.add(
      uri,
      { store: MemoryStore, destroyStoreOnDestroy: true },
      (torrent) => {
        clearTimeout(timeout);
        const info = getInfo(torrent);
        torrent.destroy();
        resolve(info);
      }
    );

    const timeout = setTimeout(() => {
      torrent.destroy();
      resolve(undefined);
    }, 5000);
  });
};

const accessTimes = new Map<string, number>();

export const updateAccessTime = (hash: string) => {
  accessTimes.set(hash, Date.now());
};

CronJob.from({
  cronTime: "0,30 * * * * *",
  start: true,
  onTick: async () => {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [hash, lastAccessed] of accessTimes) {
      if (now - lastAccessed > 1000 * 60) {
        toRemove.push(hash);
      }
    }

    for (const hash of toRemove) {
      accessTimes.delete(hash);
      const torrent = await streamClient.get(hash);
      torrent?.destroy(undefined, () => {
        console.log(`➖ ${torrent.name}`);
      });
    }
  },
});
