import { db } from "../database/index.js";
import { settings } from "../database/schema.js";
import { Settings } from "../types/settings.js";

export const saveSettings = async (formData: FormData) => {
	const parsed = Settings.parse(formData);

	Object.entries(parsed).forEach(async ([key, value]) => {
		const dbValue = typeof value !== "undefined" ? JSON.stringify(value) : null;

		await db
			.insert(settings)
			.values({ key, value: dbValue })
			.onConflictDoUpdate({
				target: settings.key,
				set: { value: dbValue },
			});
	});
};

export const getSettings = async () => {
	const rows = await db.select().from(settings);

	return Settings.parse(
		Object.fromEntries(
			rows.map(({ key, value }) => [
				key,
				value ? JSON.parse(value) : undefined,
			]),
		),
	);
};
