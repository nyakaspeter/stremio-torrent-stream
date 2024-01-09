import { Application } from "express";
import Stremio from "stremio-addon-sdk";
import { stremioStreamHandler, videoStreamHandler } from "./handlers.js";

const PORT = Number(process.env.PORT) || 58827;

const manifest: Stremio.Manifest = {
  id: "community.jackett-stream",
  version: "0.0.1",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  name: "Jackett Stream",
  description:
    "With this addon you can stream torrents from Jackett to Stremio. First you need to set up torrent trackers in Jackett using it's Web UI. Then fill the form below and hit the Install button.",
  logo: "https://webtorrent.io/img/webtorrent-small.png",
  background:
    "https://i.etsystatic.com/35367581/r/il/53bf97/4463935832/il_fullxfull.4463935832_3k3g.jpg",
  idPrefixes: ["tt"],
  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
  config: [
    {
      key: "jackettUrl",
      type: "text",
      default: process.env.DEFAULT_JACKETT_URL || "http://localhost:9117",
      title: "Jackett API URL",
      required: true,
    },
    {
      key: "jackettKey",
      type: "text",
      default: "paste your api key here",
      title: "Jackett API Key",
      required: true,
    },
  ],
};

const builder = new Stremio.addonBuilder(manifest);
builder.defineStreamHandler(stremioStreamHandler);

const { app }: { app: Application } = await Stremio.serveHTTP(
  builder.getInterface(),
  { port: PORT }
);

app.get("/stream/:torrentUri/:filePath", videoStreamHandler);
