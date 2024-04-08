import stremio from "stremio-addon-sdk";
import { streamHandler } from "./handler.js";
import { serveHTTPS } from "./https.js";
import { manifest } from "./manifest.js";

const PORT = Number(process.env.PORT) || 58827;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 58828;

const builder = new stremio.addonBuilder(manifest);
builder.defineStreamHandler(streamHandler);
const addonInterface = builder.getInterface();

// @ts-ignore
const { app } = await stremio.serveHTTP(addonInterface, { port: PORT });
await serveHTTPS(app, HTTPS_PORT);
