import { Style } from "hono/css";
import type { FC, PropsWithChildren } from "hono/jsx";
import { Header } from "./Header.js";

export const Layout: FC<PropsWithChildren> = (props) => {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="color-scheme" content="light dark" />
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.red.min.css"
				/>
				<Style />
				<title>Torrent Stream</title>
			</head>
			<body class="container">
				<Header />
				<main>{props.children}</main>
			</body>
		</html>
	);
};
