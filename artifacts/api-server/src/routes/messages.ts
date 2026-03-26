import { Router } from "express";
import { db } from "../lib/database.js";
import {
  messages,
  conversations,
  users,
  transactions,
} from "../schema/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { getSystemPrompt } from "../lib/personas.js";
import { eq, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

async function generateAIResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const aiContent = completion.choices?.[0]?.message?.content;
    if (!aiContent || typeof aiContent !== "string") {
      throw new Error("Invalid AI response shape");
    }

    return aiContent.trim();
  } catch (error) {
    console.error("OpenAI request failed:", error);
    // Fallback to mock message to keep the flow stable
    return `[AI Response|fallback] ${systemPrompt}\n\nYour message: "${userMessage}"`;
  }
}

/**
 * POST /messages
 * Send a message to a conversation
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const { conversationId, content } = req.body as {
      conversationId?: number;
      content?: string;
    };

    if (!conversationId || !content) {
      return res.status(400).json({
        error: "Missing required fields: conversationId, content",
      });
    }

    // Verify conversation exists and belongs to user
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

    const conversation = conv[0];

    // Get user's current balance
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userInfo.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userBalance = userInfo[0].balance;
    const creditsPerMessage = parseInt(
      process.env.CREDITS_PER_MESSAGE || "10"
    );

    // Check if user has enough balance
    if (userBalance < creditsPerMessage) {
      return res.status(402).json({
        error: "Insufficient balance",
        required: creditsPerMessage,
        current: userBalance,
      });
    }

    // Save user message
    const userMsg = await db
      .insert(messages)
      .values({
        conversationId,
        role: "user",
        content,
        creditsUsed: creditsPerMessage,
      })
      .returning();

    // Deduct credits from user balance
    await db
      .update(users)
      .set({ balance: userBalance - creditsPerMessage })
      .where(eq(users.id, userId));

    // Record transaction
    await db.insert(transactions).values({
      userId,
      amount: -creditsPerMessage,
      type: "debit",
      description: `Message sent in conversation: ${conversation.title}`,
      relatedMessage: userMsg[0].id,
    });

    // Get AI response
    const systemPrompt = getSystemPrompt(conversation.personaType as any);
    const aiResponse = await generateAIResponse(systemPrompt, content);

    // Save AI response
    const aiMsg = await db
      .insert(messages)
      .values({
        conversationId,
        role: "assistant",
        content: aiResponse,
        creditsUsed: 0, // AI responses don't cost extra credits
      })
      .returning();

    // Update conversation message count
    await db
      .update(conversations)
      .set({
        messageCount: conversation.messageCount + 2,
        totalCreditsUsed:
          conversation.totalCreditsUsed + creditsPerMessage,
      })
      .where(eq(conversations.id, conversationId));

    return res.status(201).json({
      userMessage: userMsg[0],
      aiMessage: aiMsg[0],
      newBalance: userBalance - creditsPerMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /messages/:conversationId
 * Get all messages in a conversation
 */
router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const conversationId = parseInt(String(req.params.conversationId), 10);

    // Verify conversation belongs to user
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

    return res.status(200).json(msgs);
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
