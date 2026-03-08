import { css } from "hono/css";
import type { FC } from "hono/jsx";

export const Header: FC = () => {
	const styles = css`
		.navigation {
		    display: flex;
		    flex-direction: column;
            align-items: center;

			ul {
            	margin: 0;
        	}

			@media (min-width: 768px) {
                flex-direction: row;

				ul {
					
				}
            }
		}

		.logo {
			height: 48px;
			object-fit: contain;

			@media (min-width: 768px) {
                height: 32px;
            }
		}
	`;

	return (
		<header class={styles}>
			<nav class="navigation">
				<ul>
					<li>
						<a href="/">
							<img src="/static/logo.webp" alt="Torrent Stream" class="logo" />
						</a>
					</li>
				</ul>
				<ul>
					<li>
						<a href="/search" class="contrast">
							Discover
						</a>
					</li>
					<li>
						<a href="/search" class="contrast">
							Search
						</a>
					</li>
					<li>
						<a href="/torrents" class="contrast">
							Torrents
						</a>
					</li>
					<li>
						<a href="/settings" class="contrast">
							Settings
						</a>
					</li>
				</ul>
			</nav>
		</header>
	);
};
