import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "@workspace/db/schema";
import { users } from "@workspace/db/schema";
import { hashPassword } from "./auth.js";

const { Pool } = pkg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");

    // Create default owner/admin account when none exists
    const ownerEmail = process.env.ADMIN_EMAIL || "owner@mustashar.ai";
    const existingOwner = await client.query(
      "SELECT id FROM users WHERE is_owner = true LIMIT 1"
    );

    if (existingOwner.rows.length === 0) {
      const existingAdmin = await client.query(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [ownerEmail]
      );

      if (existingAdmin.rows.length === 0) {
        const ownerPassword = process.env.ADMIN_PASSWORD || "Bishoysamy";
        const passwordHash = await hashPassword(ownerPassword);

        await client.query(
          "INSERT INTO users (name, email, password_hash, balance, is_admin, is_owner, must_change_password, is_active) VALUES ($1, $2, $3, $4, true, true, true, true)",
          ["Owner", ownerEmail, passwordHash, 0]
        );

        console.log("✅ Default owner/admin user created with email", ownerEmail);
      } else {
        await client.query(
          "UPDATE users SET is_admin = true, is_owner = true, must_change_password = true WHERE id = $1",
          [existingAdmin.rows[0].id]
        );
      }
    }

    client.release();
    console.log("✅ Database connection established");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

export async function closeDatabase() {
  await pool.end();
  console.log("Database connection closed");
}
