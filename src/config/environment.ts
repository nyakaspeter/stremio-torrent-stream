if (!process.env.DB_FILE_PATH) {
	throw new Error("DB_FILE_PATH is not set");
}
if (!process.env.HTTP_PORT) {
	throw new Error("HTTP_PORT is not set");
}
if (!process.env.HTTPS_PORT) {
	throw new Error("HTTPS_PORT is not set");
}

export const DB_FILE_PATH = process.env.DB_FILE_PATH || "sqlite.db";
export const HTTP_PORT = Number(process.env.HTTP_PORT || 3000);
export const HTTPS_PORT = Number(process.env.HTTPS_PORT || 3001);
