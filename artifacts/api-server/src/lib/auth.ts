import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const HASH_ITERATIONS = 100000;
const HASH_ALGORITHM = "sha256";

/**
 * Hash a password using bcrypt with a salt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against bcrypt hash or custom pbkdf2 hash format.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // bcrypt-compatible hash
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compare(password, hash);
  }

  // legacy pbkdf2 format: pbkdf2_sha256$iterations$salt$hash
  const parts = hash.split("$");
  if (parts.length === 4 && parts[0] === "pbkdf2_sha256") {
    const iterations = Number(parts[1]);
    const salt = parts[2];
    const expected = parts[3];

    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, 64, HASH_ALGORITHM, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      });
    });

    return derived.toString("hex") === expected;
  }

  return false;
}

/**
 * Generate JWT token
 */
export function generateToken(data: { userId: number; email: string; isAdmin: boolean }): string {
  return jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): {
  userId: number;
  email: string;
  isAdmin: boolean;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as any;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
