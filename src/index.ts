import Stremio from "stremio-addon-sdk";
import { streamHandler } from "./handler.js";

const PORT = Number(process.env.PORT) || 58827;

const manifest: Stremio.Manifest = {
  id: "community.torrent-stream",
  version: "0.0.1",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  name: "Torrent Stream",
  logo: "https://upload.wikimedia.org/wikipedia/en/7/79/WebTorrent_logo.png",
  background:
    "https://i.etsystatic.com/35367581/r/il/53bf97/4463935832/il_fullxfull.4463935832_3k3g.jpg",
  description:
    "This addon enables Stremio to stream movies and shows from a Torrent Stream Server",
  idPrefixes: ["tt"],
  behaviorHints: {
    // @ts-ignore
    configurable: true,
    configurationRequired: true,
  },
  config: [
    {
      title: "Stream server URL",
      key: "streamServerUrl",
      type: "text",
      required: true,
      default: "http://localhost:8000",
    },
    {
      title: "Enable Jackett search",
      key: "enableJackett",
      type: "checkbox",
      default: "checked",
    },
    {
      title: "Jackett API URL",
      key: "jackettUrl",
      type: "text",
      default: "http://localhost:9117",
    },
    {
      title: "Jackett API Key",
      key: "jackettKey",
      type: "password",
    },
    {
      title: "Use titles for torrent search",
      key: "searchByTitle",
      type: "checkbox",
    },
    {
      title: "Do not show HDR results",
      key: "disableHdr",
      type: "checkbox",
    },
    {
      title: "Do not show HEVC results",
      key: "disableHevc",
      type: "checkbox",
    },
    {
      title: "Do not show 4K results",
      key: "disable4k",
      type: "checkbox",
    },
    {
      title: "Do not show 3D results",
      key: "disable3d",
      type: "checkbox",
      default: "checked",
    },
  ],
};

const builder = new Stremio.addonBuilder(manifest);

builder.defineStreamHandler(streamHandler);

const addonInterface = builder.getInterface();

Stremio.serveHTTP(addonInterface, { port: PORT });
