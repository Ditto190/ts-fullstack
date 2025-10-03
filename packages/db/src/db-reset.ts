#!/usr/bin/env tsx
/**
 * Reset database (drop all tables)
 * Usage: yarn reset
 */
import { sql } from "drizzle-orm";
import { db } from "./client.js";

async function resetDatabase() {
  console.log("🗑️  Resetting database...");

  try {
    await db.execute(sql`DROP TABLE IF EXISTS posts CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

    console.log("✅ Database reset successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to reset database:", error);
    process.exit(1);
  }
}

resetDatabase();
