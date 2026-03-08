import { Hono } from "hono";
import { getSettings, saveSettings } from "../../config/settings.js";
import { getHttpUrl } from "../../server/http.js";
import {
	closeHttpsServer,
	getHttpsUrl,
	isHttpsEnabled,
	serveHttps,
} from "../../server/https.js";
import { issueSslCertificate } from "../../server/utils/acme.js";
import {
	clearSslCertificate,
	saveSslCertificate,
} from "../../server/utils/cert.js";
import {
	getDuckDnsDomain,
	updateDuckDnsIp,
} from "../../server/utils/duckdns.js";
import { guessLanIp } from "../../server/utils/lan.js";
import { SettingsPage } from "../pages/Settings.js";

export const settingsRoutes = new Hono();

settingsRoutes.get("/", async (c) => {
	const settings = await getSettings();
	const https = isHttpsEnabled(c.req);
	const lanIp = await guessLanIp();
	return c.render(
		<SettingsPage settings={settings} https={https} lanIp={lanIp} />,
	);
});

settingsRoutes.post("/", async (c) => {
	const formData = await c.req.formData();
	await saveSettings(formData);

	if (formData.get("issueSslCertificate")) {
		const { hostIp, emailAddress, duckDnsDomain, duckDnsToken } =
			await getSettings();

		if (!hostIp || !emailAddress || !duckDnsDomain || !duckDnsToken) {
			return c.body("Missing required settings", 400);
		}

		await updateDuckDnsIp(duckDnsDomain, duckDnsToken, hostIp);
		const sslCert = await issueSslCertificate(
			duckDnsDomain,
			emailAddress,
			duckDnsToken,
		);
		await saveSslCertificate(sslCert);
		await serveHttps();

		return c.redirect(
			`${getHttpsUrl(getDuckDnsDomain(duckDnsDomain))}/settings`,
		);
	} else if (formData.get("clearSslCertificate")) {
		const { duckDnsDomain } = await getSettings();

		if (!duckDnsDomain) {
			return c.body("Missing required settings", 400);
		}

		await clearSslCertificate(getDuckDnsDomain(duckDnsDomain));

		setTimeout(() => closeHttpsServer(), 1000);

		return c.redirect(`${getHttpUrl()}/settings`);
	}

	return c.body(null, 204);
});
