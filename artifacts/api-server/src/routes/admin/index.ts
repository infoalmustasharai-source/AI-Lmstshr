import { Router } from "express";
import { eq, gte, count, sql, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages, users, transactions } from "@workspace/db/schema";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_TOKEN) {
  throw new Error("Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_TOKEN");
}

function requireAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Invalid token" });
  }
  next();
}

// ─── Auth ───────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const body = AdminLoginBody.parse(req.body);
    if (body.email !== ADMIN_EMAIL || body.password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
    res.json({ token: ADMIN_TOKEN, email: ADMIN_EMAIL });
  } catch {
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/verify", requireAdmin, (req, res) => {
  res.json({ valid: true, email: ADMIN_EMAIL });
});

// ─── Stats ───────────────────────────────────────────────
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalConvos] = await db.select({ count: count() }).from(conversations);
    const [totalMsgs] = await db.select({ count: count() }).from(messages);
    const [todayConvos] = await db.select({ count: count() }).from(conversations).where(gte(conversations.createdAt, today));
    const [todayMsgs] = await db.select({ count: count() }).from(messages).where(gte(messages.createdAt, today));
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalBalance] = await db.select({ sum: sql<number>`coalesce(sum(balance),0)` }).from(users);
    const [totalDeposited] = await db.select({ sum: sql<number>`coalesce(sum(amount),0)` }).from(transactions).where(eq(transactions.type, "deposit"));

    const recentActivity = await db
      .select({
        date: sql<string>`date_trunc('day', ${conversations.createdAt})::date::text`,
        count: count(),
      })
      .from(conversations)
      .where(gte(conversations.createdAt, new Date(Date.now() - 7 * 24 * 3600 * 1000)))
      .groupBy(sql`date_trunc('day', ${conversations.createdAt})`)
      .orderBy(sql`date_trunc('day', ${conversations.createdAt})`);

    res.json({
      totalConversations: totalConvos.count,
      totalMessages: totalMsgs.count,
      todayConversations: todayConvos.count,
      todayMessages: todayMsgs.count,
      totalUsers: totalUsers.count,
      totalBalance: totalBalance.sum,
      totalDeposited: totalDeposited.sum,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Conversations ───────────────────────────────────────
router.get("/conversations", requireAdmin, async (req, res) => {
  try {
    const all = await db.select().from(conversations).orderBy(desc(conversations.createdAt)).limit(200);
    res.json(all);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json({ ...conv, messages: msgs });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/conversations/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Users ───────────────────────────────────────────────
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const all = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(all);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAdmin, async (req, res) => {
  try {
    const { name, phone, email, balance, plan, notes } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "الاسم والهاتف مطلوبان" });

    const [user] = await db.insert(users).values({
      name,
      phone,
      email: email || null,
      balance: balance || 0,
      plan: plan || "free",
      notes: notes || null,
    }).returning();

    if (balance > 0) {
      await db.insert(transactions).values({
        userId: user.id,
        amount: balance,
        type: "deposit",
        note: "رصيد أولي عند الإنشاء",
      });
    }

    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === "23505") return res.status(400).json({ error: "رقم الهاتف مسجل مسبقاً" });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, phone, email, plan, isActive, notes } = req.body;
    const [user] = await db.update(users)
      .set({ name, phone, email, plan, isActive, notes, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json(user);
  } catch (err: any) {
    if (err.code === "23505") return res.status(400).json({ error: "رقم الهاتف مسجل مسبقاً" });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(users).where(eq(users.id, id));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Balance ─────────────────────────────────────────────
router.post("/users/:id/balance", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, note } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: "المبلغ غير صالح" });

    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const newBalance = user.balance + parseInt(amount);
    const [updated] = await db.update(users).set({ balance: newBalance, updatedAt: new Date() }).where(eq(users.id, id)).returning();

    await db.insert(transactions).values({
      userId: id,
      amount: parseInt(amount),
      type: amount > 0 ? "deposit" : "debit",
      note: note || (amount > 0 ? "شحن رصيد" : "خصم رصيد"),
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Transactions ────────────────────────────────────────
router.get("/transactions", requireAdmin, async (req, res) => {
  try {
    const all = await db
      .select({ transaction: transactions, user: users })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(200);
    res.json(all);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
