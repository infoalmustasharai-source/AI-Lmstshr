import { Router } from "express";
import { eq } from "drizzle-orm";
import multer from "multer";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get("/conversations", async (req, res) => {
  try {
    const all = await db.select().from(conversations).orderBy(conversations.createdAt);
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const body = CreateOpenaiConversationBody.parse(req.body);
    const [conv] = await db.insert(conversations).values({ title: body.title }).returning();
    res.status(201).json(conv);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json({ ...conv, messages: msgs });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", upload.single("file"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const content = req.body.content || "";
    const file = req.file;

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    let userContent: string = content;
    let isImageUpload = false;
    let imageBase64 = "";
    let imageMimeType = "";

    if (file) {
      const isImage = file.mimetype.startsWith("image/");
      const isText = file.mimetype.startsWith("text/") || 
                     file.originalname.endsWith(".csv") ||
                     file.originalname.endsWith(".json") ||
                     file.originalname.endsWith(".md");

      if (isImage) {
        isImageUpload = true;
        imageBase64 = file.buffer.toString("base64");
        imageMimeType = file.mimetype;
        userContent = content || `قم بتحليل هذه الصورة بالتفصيل.`;
      } else if (isText) {
        const fileText = file.buffer.toString("utf-8").slice(0, 8000);
        userContent = `محتوى الملف "${file.originalname}":\n\`\`\`\n${fileText}\n\`\`\`\n\n${content || "قم بتحليل هذا الملف وتلخيص محتواه."}`;
      } else {
        userContent = content || `تم رفع ملف: ${file.originalname}`;
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "user", content: userContent });

    const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

    const systemMessage = {
      role: "system" as const,
      content: "أنت المستشار AI، مساعد ذكاء اصطناعي متقدم يقدم تحليلات دقيقة ومشورة احترافية. تتحدث بالعربية بأسلوب واضح ومنظم. عند تحليل الملفات والصور، قدّم تحليلاً شاملاً ومفيداً.",
    };

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const chatMessages = history.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    let lastMessage: any;
    if (isImageUpload) {
      lastMessage = {
        role: "user" as const,
        content: [
          { type: "text", text: userContent },
          { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
        ],
      };
    } else {
      lastMessage = { role: "user" as const, content: userContent };
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [systemMessage, ...chatMessages, lastMessage],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    res.write(`data: ${JSON.stringify({ error: "فشل الاتصال بالذكاء الاصطناعي" })}\n\n`);
    res.end();
  }
});

export default router;
