import Stremio from "stremio-addon-sdk";
import { streamHandler } from "./handler.js";

const PORT = Number(process.env.PORT) || 58827;

const manifest: Stremio.Manifest = {
  id: "community.jackett-stream",
  version: "0.0.1",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  name: "Jackett Stream",
  logo: "https://user-images.githubusercontent.com/27040483/28728094-99f3e3f6-73c7-11e7-8f8d-28912dc6ac0d.png",
  background:
    "https://i.etsystatic.com/35367581/r/il/53bf97/4463935832/il_fullxfull.4463935832_3k3g.jpg",
  description:
    "This addon can enable Stremio to stream movies and series from torrents returned by a Jackett API. To make it work you'll need to set up torrent trackers in Jackett using it's Web UI and run a Torrent stream server.",
  idPrefixes: ["tt"],
  behaviorHints: {
    // @ts-ignore
    configurable: true,
    configurationRequired: true,
  },
  config: [
    {
      title: "Jackett API URL",
      key: "jackettUrl",
      type: "text",
      required: true,
      default: "http://localhost:9117",
    },
    {
      title: "Jackett API Key",
      key: "jackettKey",
      type: "text",
      required: true,
      default: "paste your api key here",
    },
    {
      title: "Stream server URL",
      key: "streamServerUrl",
      type: "text",
      required: true,
      default: "http://localhost:8000",
    },
  ],
};

const builder = new Stremio.addonBuilder(manifest);

builder.defineStreamHandler(streamHandler);

const addonInterface = builder.getInterface();

Stremio.serveHTTP(addonInterface, { port: PORT });
