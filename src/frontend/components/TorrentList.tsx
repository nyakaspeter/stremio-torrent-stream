import { css } from "hono/css";
import type { FC } from "hono/jsx";
import { getReadableSize } from "../../search/utils/file.js";
import type { TorrentSearchResult } from "../../types/search.js";
import { Badge } from "./Badge.js";

export const TorrentList: FC<{ torrents: TorrentSearchResult[] }> = (props) => {
	const styles = css`
        .torrent-link {
            text-decoration: none;
            color: inherit;
        }
        .torrent-link:hover {
            .torrent-card {
                box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.01);
            }
        }
        .torrent-card {
            display: flex;
            flex-direction: column;
            gap: 8px;

            @media (min-width: 1280px) {
                flex-direction: row;
                align-items: center;
            }
        }
        .torrent-card-title {
           word-break: break-all;
        }
        .torrent-card-badges {
            display: flex;
            justify-content: end;
            gap: 8px;
            flex-wrap: wrap;

            @media (min-width: 1280px) {
                flex-wrap: nowrap;
            }
        }
        .spacer {
            flex: 1;
        }
    `;

	return (
		<div class={styles}>
			{props.torrents.map((torrent) => (
				<a class="torrent-link" href="www.google.com">
					<article class="torrent-card">
						<div class="torrent-card-title">{torrent.name}</div>
						<div class="spacer"></div>
						<div class="torrent-card-badges">
							<Badge class="secondary">{torrent.tracker}</Badge>
							{torrent.size !== undefined && (
								<Badge class="secondary">{getReadableSize(torrent.size)}</Badge>
							)}
							{torrent.seeds !== undefined && (
								<Badge class="secondary">{torrent.seeds} seeds</Badge>
							)}
							{torrent.peers !== undefined && (
								<Badge class="secondary">{torrent.peers} peers</Badge>
							)}
						</div>
					</article>
				</a>
			))}
		</div>
	);
};
