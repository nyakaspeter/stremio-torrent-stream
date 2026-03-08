import * as z from "zod";
import { zfd } from "zod-form-data";
import { TorrentFormat, TorrentProvider } from "./search.js";

export const Settings = zfd.formData({
	hostIp: zfd.text(z.string().optional()),
	emailAddress: zfd.text(z.string().optional()),
	duckDnsDomain: zfd.text(z.string().optional()),
	duckDnsToken: zfd.text(z.string().optional()),
	enabledProviders: zfd
		.repeatableOfType(zfd.text())
		.default([TorrentProvider.YTS, TorrentProvider.EZTV]),
	insaneUsername: zfd.text(z.string().optional()),
	insanePassword: zfd.text(z.string().optional()),
	ncoreUsername: zfd.text(z.string().optional()),
	ncorePassword: zfd.text(z.string().optional()),
	jackettApiAddress: zfd.text(z.string().optional()),
	jackettApiKey: zfd.text(z.string().optional()),
	disabledFormats: zfd
		.repeatableOfType(zfd.text())
		.default([TorrentFormat.CAM, TorrentFormat["3D"]]),
	keepDownloadedFiles: zfd.checkbox(),
	seedTorrents: zfd.checkbox(),
	seedMinutes: zfd.numeric(z.number().optional()),
	seedRatio: zfd.numeric(z.number().optional()),
	titleSearch: zfd.checkbox(),
});

export type Settings = z.infer<typeof Settings>;
