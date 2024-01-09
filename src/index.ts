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
  description: "Stream torrents from Jackett",
  idPrefixes: ["tt"],
  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
  config: [
    {
      key: "jackettUrl",
      type: "text",
      default: "http://localhost:9117",
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
