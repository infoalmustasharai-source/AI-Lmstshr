import Database from "better-sqlite3";
import { hashPassword } from "./auth.js";

const dbFile = process.env.DATABASE_URL?.replace(/^file:\/\//, "") || "./dev.db";
const db = new Database(dbFile, { verbose: console.log });

// create schema if needed
const createUsers = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  is_admin INTEGER NOT NULL DEFAULT 0,
  is_owner INTEGER NOT NULL DEFAULT 0,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);`;

db.exec(createUsers);

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  balance: number;
  plan: string;
  is_admin: number;
  is_owner: number;
  must_change_password: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export function initializeDatabase(): boolean {
  const ownerEmail = process.env.ADMIN_EMAIL || "bishoysamy390@gmail.com";
  const ownerPassword = process.env.ADMIN_PASSWORD || "Bishoysamy2020";

  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(ownerEmail);
  if (!row) {
    const hash = hashPassword(ownerPassword);
    db.prepare(
      `INSERT INTO users (name, email, password_hash, balance, is_admin, is_owner, must_change_password, is_active)
       VALUES (?, ?, ?, 999999, 1, 1, 0, 1)`
    ).run("Owner", ownerEmail, hash);
    console.log("✅ default owner created", ownerEmail);
  }

  return true;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
}

export function createUser(name: string, email: string, password_hash: string): UserRow {
  const result = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, balance, plan, is_admin, is_owner, must_change_password, is_active)
       VALUES (?, ?, ?, 0, 'free', 0, 0, 0, 1)`
    )
    .run(name, email, password_hash);

  return {
    id: Number(result.lastInsertRowid),
    name,
    email,
    password_hash,
    balance: 0,
    plan: "free",
    is_admin: 0,
    is_owner: 0,
    must_change_password: 0,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function updateLastLogin(userId: number) {
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(userId);
}
