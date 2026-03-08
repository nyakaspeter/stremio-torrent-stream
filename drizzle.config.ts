import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { DB_FILE_PATH } from "./src/config/environment.js";

export default defineConfig({
	out: "./src/database/migrations",
	schema: "./src/database/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: DB_FILE_PATH,
	},
});
