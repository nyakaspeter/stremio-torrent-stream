import { Hono } from "hono";
import { searchTorrents } from "../../search/index.js";
import { filterTorrents } from "../../search/utils/filter.js";
import { SearchPage } from "../pages/Search.js";

export const searchRoutes = new Hono();

searchRoutes.get("/", async (c) => {
	const query = c.req.query("query");

	if (query) {
		const results = await searchTorrents(query);
		const filteredResults = await filterTorrents(results);
		return c.render(<SearchPage query={query} results={filteredResults} />);
	}

	return c.render(<SearchPage />);
});
