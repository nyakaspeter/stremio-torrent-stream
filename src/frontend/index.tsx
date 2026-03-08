import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "./components/Layout.js";
import { searchRoutes } from "./routes/search.js";
import { settingsRoutes } from "./routes/settings.js";

export const frontend = new Hono();

frontend.use(
	jsxRenderer(({ children }) => {
		return <Layout>{children}</Layout>;
	}),
);
frontend.use("/static/*", serveStatic({ root: "./src/frontend" }));
frontend.get("/", (c) => c.redirect("/search"));
frontend.route("/search", searchRoutes);
frontend.route("/settings", settingsRoutes);
