import "dotenv/config";
import Stremio from "stremio-addon-sdk";
import { streamHandler } from "./stream-handler.js";
import "./stream-server.js";

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest: Stremio.Manifest = {
  id: "community.jackett-stream",
  version: "0.0.1",
  catalogs: [],
  resources: ["stream"],
  types: ["movie", "series"],
  name: "Jackett Stream",
  description: "Stream torrents from Jackett",
  idPrefixes: ["tt"],
};

const builder = new Stremio.addonBuilder(manifest);

builder.defineStreamHandler(streamHandler);

Stremio.serveHTTP(builder.getInterface(), {
  port: Number(process.env.ADDON_PORT) || 58827,
});

// when you've deployed your addon, un-comment this line
// publishToCentral("https://my-addon.awesome/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
