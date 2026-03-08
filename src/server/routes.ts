import { Hono } from "hono";
import { api } from "../api/routes.js";
import { frontend } from "../frontend/index.js";

export const app = new Hono();

app.route("/", frontend);
app.route("/api", api);
