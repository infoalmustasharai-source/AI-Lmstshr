import { Router } from "express";
import { db } from "../lib/database.js";
import {
  conversations,
  messages,
  PERSONA_TYPES,
} from "@workspace/db/schema";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();

/**
 * POST /conversations
 * Create a new conversation
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const { personaType, title } = req.body as {
      personaType?: string;
      title?: string;
    };

    if (!personaType || !PERSONA_TYPES.includes(personaType as any)) {
      return res.status(400).json({
        error: `Invalid persona type. Must be one of: ${PERSONA_TYPES.join(", ")}`,
      });
    }

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newConversation = await db
      .insert(conversations)
      .values({
        userId,
        personaType: personaType as any,
        title,
      })
      .returning();

    return res.status(201).json(newConversation[0]);
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /conversations
 * Get all conversations for current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));

    return res.status(200).json(userConversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /conversations/:id
 * Get a single conversation with messages
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = parseInt(req.params.id);

    const conv = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .limit(1);

    if (conv.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    return res.status(200).json({
      conversation: conv[0],
      messages: msgs,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /conversations/:id
 * Delete a conversation
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = parseInt(req.params.id);

    const conv = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .limit(1);

    if (conv.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await db
      .delete(conversations)
      .where(eq(conversations.id, conversationId));

    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
