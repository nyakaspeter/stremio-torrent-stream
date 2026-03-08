import { getSettings } from "../config/settings.js";
import { logger } from "../server/logger.js";
import {
	type NcoreCategory,
	TorrentCategory,
	TorrentProvider,
	type TorrentSearchResult,
} from "../types/search.js";
import {
	NCORE_MOVIE_CATEGORIES,
	NCORE_SHOW_CATEGORIES,
	searchNcoreTorrents,
} from "./providers/ncore.js";

export const searchTorrents = async (
	query: string,
	categories?: TorrentCategory[],
) => {
	const {
		enabledProviders,
		insaneUsername,
		insanePassword,
		ncoreUsername,
		ncorePassword,
		jackettApiAddress,
		jackettApiKey,
	} = await getSettings();

	const searchAllCategories = !categories?.length;

	const promises: Promise<TorrentSearchResult[]>[] = [];

	if (enabledProviders?.includes(TorrentProvider.nCore)) {
		const ncoreCategories: NcoreCategory[] = [];

		if (categories?.includes(TorrentCategory.Movie) || searchAllCategories) {
			ncoreCategories?.push(...NCORE_MOVIE_CATEGORIES);
		}

		if (categories?.includes(TorrentCategory.Show) || searchAllCategories) {
			ncoreCategories.push(...NCORE_SHOW_CATEGORIES);
		}

		promises.push(
			searchNcoreTorrents(query, ncoreCategories, ncoreUsername, ncorePassword),
		);
	}

	const results = (await Promise.all(promises)).flat();

	logger.info(`Search: got ${results.length} results for ${query}`);

	return results;
};
