import axios from "axios";
import https from "https";
import localtunnel from "localtunnel";
import Stremio from "stremio-addon-sdk";
import { streamHandler } from "./handler.js";

const PORT = Number(process.env.PORT) || 58827;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 58828;

const ENABLE_LOCALIP = process.env.ENABLE_LOCALIP
  ? process.env.ENABLE_LOCALIP === "true"
  : true;

const ENABLE_LOCALTUNNEL = process.env.ENABLE_LOCALTUNNEL
  ? process.env.ENABLE_LOCALTUNNEL === "true"
  : false;

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
      default: "http://192.168.0.10:8000",
    },
    {
      title: "Enable Jackett search",
      key: "enableJackett",
      type: "checkbox",
    },
    {
      title: "Jackett API URL",
      key: "jackettUrl",
      type: "text",
      default: "http://192.168.0.10:9117",
    },
    {
      title: "Jackett API Key",
      key: "jackettKey",
      type: "password",
    },
    {
      title: "Enable nCore search",
      key: "enableNcore",
      type: "checkbox",
    },
    {
      title: "nCore username",
      key: "nCoreUser",
      type: "text",
    },
    {
      title: "nCore password",
      key: "nCorePassword",
      type: "password",
    },
    {
      title: "Enable iTorrent search",
      key: "enableItorrent",
      type: "checkbox",
      default: "checked",
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
      title: "Do not show CAM results",
      key: "disableCam",
      type: "checkbox",
      default: "checked",
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

// @ts-ignore
const { app } = await Stremio.serveHTTP(addonInterface, { port: PORT });
console.log(`HTTP addon listening on port ${PORT}`);

if (ENABLE_LOCALIP) {
  const key = (await axios.get("http://local-ip.co/cert/server.key")).data;
  const serverPem = (await axios.get("http://local-ip.co/cert/server.pem"))
    .data;
  const chainPem = (await axios.get("http://local-ip.co/cert/chain.pem")).data;
  const cert = `${serverPem}\n${chainPem}`;
  const httpsServer = https.createServer({ key, cert }, app);
  httpsServer.listen(HTTPS_PORT);
  console.log(`HTTPS addon listening on port ${HTTPS_PORT}`);
}

if (ENABLE_LOCALTUNNEL) {
  const tunnel = await localtunnel({ port: PORT });
  console.log(`Tunnel accessible at: ${tunnel.url}`);
  const tunnelPassword = await axios.get("https://loca.lt/mytunnelpassword");
  console.log(`Tunnel password: ${tunnelPassword.data}`);
}
