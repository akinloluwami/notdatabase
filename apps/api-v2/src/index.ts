import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { docsRoutes } from "./routes/docs.js";
import { bulkRoutes } from "./routes/bulk.js";
import { countRoutes } from "./routes/count.js";
import { schemaRoutes } from "./routes/schema.js";
import { realtimeRoutes } from "./routes/realtime.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "NotDatabase API v2" });
});

// Routes
app.route("/:collection/docs", docsRoutes);
app.route("/:collection/bulk", bulkRoutes);
app.route("/:collection/count", countRoutes);
app.route("/:collection/schema", schemaRoutes);
app.route("/realtime", realtimeRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
