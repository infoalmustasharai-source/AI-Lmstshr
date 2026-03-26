import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";
import * as schema from "../schema/index.js";
import { users } from "../schema/users.js";
import { hashPassword } from "./auth.js";

const databaseFile = process.env.DATABASE_URL?.startsWith("file:")
  ? process.env.DATABASE_URL.replace("file:", "")
  : process.env.DATABASE_URL || "./dev.db";

const dbConnection = new Database(databaseFile, { verbose: console.log });
export const db = drizzle(dbConnection, { schema });

export async function initializeDatabase() {
  try {
    const sqlPath = path.resolve(new URL(import.meta.url).pathname, "../../init-db.sql");
    if (fs.existsSync(sqlPath)) {
      const schemaSql = fs.readFileSync(sqlPath, "utf8");
      dbConnection.exec(schemaSql);
    }

    const ownerEmail = process.env.ADMIN_EMAIL || "bishoysamy390@gmail.com";
    const ownerPassword = process.env.ADMIN_PASSWORD || "Bishoysamy2020";

    const existingOwner = await db
      .select()
      .from(users)
      .where(eq(users.isOwner, true))
      .limit(1);

    if (existingOwner.length === 0) {
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.email, ownerEmail))
        .limit(1);

      if (existingAdmin.length === 0) {
        const passwordHash = await hashPassword(ownerPassword);

        await db.insert(users).values({
          name: "Owner",
          email: ownerEmail,
          passwordHash,
          balance: 999999,
          plan: "pro",
          isAdmin: true,
          isOwner: true,
          mustChangePassword: true,
          isActive: true,
        });

        console.log("✅ Default owner/admin user created with email", ownerEmail);
      } else {
        await db
          .update(users)
          .set({ isAdmin: true, isOwner: true, mustChangePassword: true, isActive: true })
          .where(eq(users.id, existingAdmin[0].id));

        console.log("✅ Existing user promoted to owner/admin", ownerEmail);
      }
    }

    console.log("✅ Database initialization successful");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

export async function closeDatabase() {
  try {
    dbConnection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database:", error);
  }
}

