import { createServer, type Server } from "node:https";
import { createSecureContext, type SecureContext } from "node:tls";
import { createAdaptorServer } from "@hono/node-server";
import type { HonoRequest } from "hono";
import { HTTPS_PORT } from "../config/environment.js";
import { logger } from "./logger.js";
import { app } from "./routes.js";
import { getSslCertificate } from "./utils/cert.js";

let server: Server | undefined;

export const isHttpsEnabled = (request: HonoRequest) => {
	return (
		new URL(request.url).protocol === "https:" ||
		request.header("x-forwarded-proto") === "https"
	);
};

export const getHttpsUrl = (domain: string) => {
	return `https://${domain}:${HTTPS_PORT}`;
};

export const serveHttps = async () => {
	const sslCert = await getSslCertificate();
	if (!sslCert) return;
	return new Promise<void>((resolve, reject) => {
		try {
			server = createAdaptorServer({
				fetch: app.fetch,
				createServer,
				serverOptions: {
					SNICallback: async (
						domain: string,
						callback: (err: Error | null, ctx?: SecureContext) => void,
					) => {
						try {
							const sslCert = await getSslCertificate(domain);
							if (sslCert) {
								const secureContext = createSecureContext({
									key: sslCert.key,
									cert: sslCert.cert,
								});
								callback(null, secureContext);
							} else {
								callback(
									new Error(`No certificate found for domain: ${domain}`),
								);
							}
						} catch (error) {
							callback(error as Error);
						}
					},
				},
			}) as Server;

			server.listen(HTTPS_PORT, () => {
				logger.info(
					`HTTPS server is running on ${getHttpsUrl(sslCert.domain)}`,
				);
				resolve();
			});
		} catch (error) {
			reject(error);
		}
	});
};

export const closeHttpsServer = async () => {
	if (!server) return;
	return new Promise<void>((resolve, reject) => {
		server?.closeAllConnections();
		server?.close((error) => {
			if (error) {
				reject(error);
			} else {
				logger.info("HTTPS server closed");
				resolve();
			}
		});
	});
};
