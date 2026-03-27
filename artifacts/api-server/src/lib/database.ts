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
  phone TEXT,
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

const createChats = `
CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT,
  personality TEXT NOT NULL DEFAULT 'general',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

const createMessages = `
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

const createFiles = `
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT,
  size INTEGER,
  s3_key TEXT,
  extracted_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

const createTransactions = `
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  admin_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);`;

db.exec(createUsers);
db.exec(createChats);
db.exec(createMessages);
db.exec(createFiles);
db.exec(createTransactions);

export interface UserRow {
  id: number;
  name: string;
  email: string;
  phone?: string;
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

export function updateUserPassword(userId: number, passwordHash: string) {
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(passwordHash, userId);
}

// User management functions
export function getUserById(userId: number): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRow | undefined;
}

export function updateUserBalance(userId: number, amount: number) {
  db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, userId);
}

export function setUserBalance(userId: number, balance: number) {
  db.prepare("UPDATE users SET balance = ? WHERE id = ?").run(balance, userId);
}

export function getAllUsers() {
  return db.prepare("SELECT id, name, email, phone, balance, plan, is_admin, is_active, created_at FROM users ORDER BY created_at DESC").all();
}

export function updateUserActive(userId: number, isActive: boolean) {
  db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, userId);
}

// Chat functions
export function createChat(userId: number, personality: string = "general") {
  const result = db.prepare(
    "INSERT INTO chats (user_id, personality) VALUES (?, ?)"
  ).run(userId, personality);
  return Number(result.lastInsertRowid);
}

export function getUserChats(userId: number) {
  return db.prepare("SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC").all(userId);
}

export function getChatById(chatId: number) {
  return db.prepare("SELECT * FROM chats WHERE id = ?").get(chatId);
}

// Message functions
export function addMessage(chatId: number, userId: number, role: string, content: string, tokensUsed: number = 0) {
  const result = db.prepare(
    "INSERT INTO messages (chat_id, user_id, role, content, tokens_used) VALUES (?, ?, ?, ?, ?)"
  ).run(chatId, userId, role, content, tokensUsed);
  return Number(result.lastInsertRowid);
}

export function getChatMessages(chatId: number) {
  return db.prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC").all(chatId);
}

// File functions
export function uploadFile(userId: number, filename: string, originalName: string, fileType: string, size: number, s3Key?: string) {
  const result = db.prepare(
    "INSERT INTO files (user_id, filename, original_name, file_type, size, s3_key) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, filename, originalName, fileType, size, s3Key || null);
  return Number(result.lastInsertRowid);
}

export function getUserFiles(userId: number) {
  return db.prepare("SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC").all(userId);
}

// Transaction functions
export function addTransaction(userId: number, type: string, amount: number, description: string, adminId?: number) {
  const result = db.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, admin_id) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, type, amount, description, adminId || null);
  return Number(result.lastInsertRowid);
}

export function getUserTransactions(userId: number) {
  return db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
}

export function getAllTransactions() {
  return db.prepare("SELECT * FROM transactions ORDER BY created_at DESC").all();
}
