import { serve } from "@hono/node-server";
import { HTTP_PORT } from "../config/environment.js";
import { logger } from "./logger.js";
import { app } from "./routes.js";

export const getHttpUrl = () => {
	return `http://localhost:${HTTP_PORT}`;
};

export const serveHttp = async () => {
	return new Promise<void>((resolve, reject) => {
		try {
			serve(
				{
					fetch: app.fetch,
					port: HTTP_PORT,
				},
				() => {
					logger.info(`HTTP server is running on ${getHttpUrl()}`);
					resolve();
				},
			);
		} catch (error) {
			reject(error);
		}
	});
};
