import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { DB_FILE_PATH } from "../config/environment.js";
import * as schema from "./schema.js";

const dbDir = dirname(DB_FILE_PATH);
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

export const db = drizzle(`file:${DB_FILE_PATH}`, { schema });

export const migrateDb = async () => {
	await migrate(db, { migrationsFolder: "./src/database/migrations" });
};
