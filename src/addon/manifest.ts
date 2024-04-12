import { Manifest } from "stremio-addon-sdk";

export const manifest: Manifest = {
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
      title: "Enable Jackett search",
      key: "enableJackett",
      type: "checkbox",
    },
    {
      title: "Jackett API URL",
      key: "jackettUrl",
      type: "text",
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
      default: "checked",
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
      title: "Enable iNSANE search",
      key: "enableInsane",
      type: "checkbox",
    },
    {
      title: "iNSANE username",
      key: "insaneUser",
      type: "text",
    },
    {
      title: "iNSANE password",
      key: "insanePassword",
      type: "password",
    },
    {
      title: "Enable iTorrent search",
      key: "enableItorrent",
      type: "checkbox",
    },
    {
      title: "Enable YTS search",
      key: "enableYts",
      type: "checkbox",
    },
    {
      title: "Enable EZTV search",
      key: "enableEztv",
      type: "checkbox",
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
