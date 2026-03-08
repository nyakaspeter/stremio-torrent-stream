import "dotenv/config";

import { migrateDb } from "./database/index.js";
import { serveHttp } from "./server/http.js";
import { serveHttps } from "./server/https.js";

await migrateDb();
await serveHttp();
await serveHttps();
