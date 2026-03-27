import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const HASH_ITERATIONS = 150000;
const HASH_ALGORITHM = "sha256";
const HASH_KEYLEN = 64;
const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): string {
  // use bcrypt by default for new passwords (backwards compatible with existing bcrypt hashes)
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!hash || typeof hash !== "string") return false;

  if (hash.startsWith("pbkdf2_sha256$")) {
    const parts = hash.split("$");
    if (parts.length !== 4) return false;
    const [, iterationsStr, salt, expected] = parts;
    const iterations = Number(iterationsStr) || HASH_ITERATIONS;
    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, HASH_KEYLEN, HASH_ALGORITHM);
    return derivedKey.toString("hex") === expected;
  }

  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compareSync(password, hash);
  }

  // unrecognized scheme
  return false;
}

export function generateToken(payload: { userId: number; email: string; isAdmin: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; isAdmin: boolean };
  } catch {
    return null;
  }
}
