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
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  req.user = user;
  next();
}

/**
 * Middleware to check if user is admin
 */
export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
}
