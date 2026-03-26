import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const HASH_ITERATIONS = 100000;
const HASH_ALGORITHM = "sha256";

/**
 * Hash password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, "salt" + Math.random(), HASH_ITERATIONS, 64, HASH_ALGORITHM, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString("hex"));
    });
  });
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
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
