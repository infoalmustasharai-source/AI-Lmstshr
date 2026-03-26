import { Router } from "express";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { db } from "../lib/database.js";
import { users } from "../schema/users.js";
import { hashPassword, generateToken, verifyPassword } from "../lib/auth.js";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

const router = Router();

const adminEmail = process.env.ADMIN_EMAIL || "owner@mustashar.ai";
const adminPassword = process.env.ADMIN_PASSWORD || "Bishoysamy";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

async function emailSend(to: string, subject: string, text: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.info("Email config not set, skipping actual send. Message to", to, subject);
    console.info(text);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@mustashar.ai",
    to,
    subject,
    text,
  });
}

/**
 * POST /auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: name, email, password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        balance: 0, // Start with 0 credits, admin must charge
      })
      .returning();

    // Generate token
    const user = newUser[0];
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/login
 * Login user with email and password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email, password",
      });
    }

    // Find user
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = foundUsers[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        error: "User account is inactive",
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
        isOwner: user.isOwner,
        mustChangePassword: user.mustChangePassword,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/google
 * Log in or register via Google ID token
 */
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }

    const email = payload.email;
    const name = payload.name || payload.given_name || "Google User";

    let foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user = foundUsers[0];

    if (!user) {
      // Create user with a random password hash (OAuth-only)
      const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
      const createUser = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
          balance: 0,
          isActive: true,
          isAdmin: false,
          isOwner: false,
          mustChangePassword: false,
        })
        .returning();
      user = createUser[0];
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
        isOwner: user.isOwner,
        mustChangePassword: user.mustChangePassword,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/forgot-password
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(200).json({ message: "If user exists, password recovery email has been sent." });
    }

    const user = foundUsers[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({ passwordResetToken: resetToken, passwordResetExpires: expires })
      .where(eq(users.id, user.id));

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    await emailSend(
      user.email,
      "Password reset request",
      `Use this link to reset your password (valid for 1 hour): ${resetUrl}`
    );

    return res.status(200).json({ message: "Password recovery email sent if account exists" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/reset-password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = foundUsers[0];
    if (!user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const passwordHash = await hashPassword(password);
    await db
      .update(users)
      .set({ passwordHash, passwordResetToken: null, passwordResetExpires: null, mustChangePassword: false })
      .where(eq(users.id, user.id));

    return res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/change-password
 */
router.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body as {
      email?: string;
      oldPassword?: string;
      newPassword?: string;
    };

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "Email, old password, and new password are required" });
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = foundUsers[0];
    const valid = await verifyPassword(oldPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const newHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: newHash, mustChangePassword: false })
      .where(eq(users.id, user.id));

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/me
 * Get current user info (requires auth)
 */
router.post("/me", async (req, res) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = foundUsers[0];

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
