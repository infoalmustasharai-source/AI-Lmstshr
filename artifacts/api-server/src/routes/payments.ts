import { Router } from "express";
import crypto from "crypto";
import { db } from "../lib/database.js";
import { users, transactions } from "../schema/index.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * POST /payments/whatsapp
 * Create a WhatsApp recharge request + deep link
 */
router.post("/whatsapp", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const { amount } = req.body as { amount?: number };

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const whatsappNumber = process.env.WHATSAPP_NUMBER || process.env.ADMIN_PHONE || "01130031531";
    const referenceId = cryptoRandom(10);
    const message = `Hi, I want to recharge my Mustashar wallet with ${amount} credits. User ID: ${userId}. Reference: ${referenceId}`;
    const encoded = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    await db.insert(transactions).values({
      userId,
      amount,
      type: "whatsapp-pending",
      description: `WhatsApp recharge request ${referenceId}`,
      adminId: null,
    });

    return res.status(200).json({ whatsappLink, referenceId });
  } catch (error) {
    console.error("WhatsApp payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /payments/whatsapp/confirm
 * Admin confirms a WhatsApp recharge, credits user and records transaction
 */
router.post("/whatsapp/confirm", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, amount, referenceId } = req.body as {
      userId?: number;
      amount?: number;
      referenceId?: string;
    };

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and amount are required" });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBalance = user[0].balance + amount;
    const updatedUser = await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId)).returning();

    const adminId = (req as any).user?.userId;

    await db.insert(transactions).values({
      userId,
      amount,
      type: "whatsapp-confirmed",
      description: `WhatsApp confirmed recharge ${referenceId || "-"}`,
      adminId,
    });

    return res.status(200).json({ user: updatedUser[0], amount, referenceId });
  } catch (error) {
    console.error("Confirm WhatsApp deposit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

function cryptoRandom(length: number) {
  return [...Array(length)]
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join("")
    .toUpperCase();
}

export default router;
