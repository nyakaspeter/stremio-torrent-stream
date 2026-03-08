import type { FC } from "hono/jsx";
import type { TorrentSearchResult } from "../../types/search.js";
import { TorrentList } from "../components/TorrentList.js";

export const SearchPage: FC<{
	query?: string;
	results?: TorrentSearchResult[];
}> = ({ query, results }) => {
	return (
		<>
			<section>
				{/** biome-ignore lint/a11y/useSemanticElements: picocss grouping only works within the form element */}
				<form role="search">
					<input
						name="query"
						type="search"
						placeholder="Type here to search for movie or tv show torrents"
						value={query}
					/>
					<input type="submit" value="Search" />
				</form>
			</section>
			{results && (
				<section>
					<TorrentList torrents={results} />
				</section>
			)}
		</>
	);
};
