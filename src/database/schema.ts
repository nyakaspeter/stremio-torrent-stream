import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
	key: text().primaryKey(),
	value: text(),
});

export const certificates = sqliteTable("certificates", {
	domain: text().primaryKey(),
	key: text().notNull(),
	cert: text().notNull(),
	expiry: integer({ mode: "timestamp" }).notNull(),
});
