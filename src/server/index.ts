
// ============================================================================
// FILE: src/server/index.ts
// Main Hono server entry point
// ============================================================================

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getDatabase, initializeSchema } from "../db";
import usersRoutes from "./routes/users";

// Initialize database
const db = getDatabase();
initializeSchema(db);

// Create Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

// API routes
app.route("/api/users", usersRoutes);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// Start server
const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${port}`);
