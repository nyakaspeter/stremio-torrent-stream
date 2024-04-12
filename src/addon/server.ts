import { Application } from "express";
import stremio from "stremio-addon-sdk";
import { streamHandler } from "./streams.js";
import { manifest } from "./manifest.js";
import { Server } from "http";

export const serveHTTP = async (port: number) => {
  const builder = new stremio.addonBuilder(manifest);

  // @ts-ignore
  builder.defineStreamHandler(streamHandler);
  const addonInterface = builder.getInterface();

  // @ts-ignore
  const {
    url,
    server,
    app,
  }: { url: string; server: Server; app: Application } =
    await stremio.serveHTTP(addonInterface, { port });

  return app;
};
