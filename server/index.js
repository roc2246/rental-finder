// Rental Finder API Server
// Main entry point for the Express application
// Initializes database connection, middleware, and scheduled tasks

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./models/db.js";
import initializeChron from "./chron/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './config/.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Health check endpoint
 */
app.get("/", (req, res) => res.send("Rental Finder API"));

/**
 * Status endpoint for monitoring
 */
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Initialize scheduled/cron tasks (e.g., periodic scraping)
initializeChron();

/**
 * Starts the Express server and establishes database connection
 * @async
 * @throws {Error} - Logs error and exits process if startup fails
 */
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
