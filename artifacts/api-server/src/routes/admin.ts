import { Router } from "express";
import { db } from "../lib/database.js";
import { users, transactions } from "@workspace/db/schema";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /admin/users
 * Get all users
 */
router.get("/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users);

    return res.status(200).json(
      allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        balance: u.balance,
        isAdmin: u.isAdmin,
        isActive: u.isActive,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /admin/users/:id
 * Get a specific user details
 */
router.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    return res.status(200).json({
      user: user[0],
      transactions: userTransactions,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /admin/users/:id/credit
 * Add credits to a user (manual charge)
 */
router.post("/users/:id/credit", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { amount, description } = req.body as {
      amount?: number;
      description?: string;
    };
    const adminId = (req as any).user?.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Must be a positive number",
      });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBalance = user[0].balance + amount;

    // Update user balance
    const updatedUser = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();

    // Record transaction
    const transaction = await db
      .insert(transactions)
      .values({
        userId,
        amount,
        type: "admin-credit",
        description:
          description ||
          `Manual credit added by admin ${adminId}`,
        adminId,
      })
      .returning();

    return res.status(200).json({
      user: updatedUser[0],
      transaction: transaction[0],
    });
  } catch (error) {
    console.error("Add credit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /admin/users/:id/debit
 * Debit credits from a user
 */
router.post("/users/:id/debit", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { amount, description } = req.body as {
      amount?: number;
      description?: string;
    };
    const adminId = (req as any).user?.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Must be a positive number",
      });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBalance = Math.max(0, user[0].balance - amount);

    // Update user balance
    const updatedUser = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();

    // Record transaction
    const transaction = await db
      .insert(transactions)
      .values({
        userId,
        amount: -amount,
        type: "debit",
        description:
          description ||
          `Manual debit by admin ${adminId}`,
        adminId,
      })
      .returning();

    return res.status(200).json({
      user: updatedUser[0],
      transaction: transaction[0],
    });
  } catch (error) {
    console.error("Debit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /admin/transactions
 * Get all transactions (paginated)
 */
router.get("/transactions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const allTransactions = await db
      .select()
      .from(transactions)
      .limit(limit)
      .offset(offset);

    return res.status(200).json(allTransactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /admin/users/:id/toggle-active
 * Toggle user active status
 */
router.post("/users/:id/toggle-active", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await db
      .update(users)
      .set({ isActive: !user[0].isActive })
      .where(eq(users.id, userId))
      .returning();

    return res.status(200).json({
      message: `User ${updatedUser[0].isActive ? "activated" : "deactivated"}`,
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Toggle active error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
