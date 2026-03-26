import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyToken } from "../lib/auth.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    isAdmin: boolean;
  };
}

/**
 * Middleware to check if user is authenticated
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return;
  }

  req.user = user;
  next();
}

/**
 * Middleware to check if user is admin
 */
export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Forbidden: Admin access required" });
    return;
  }
  next();
}
