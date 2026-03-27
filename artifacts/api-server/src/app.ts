import express, { Request, Response } from "express";
import cors from "cors";
import {
  getUserByEmail,
  createUser,
  updateLastLogin,
  getUserById,
  updateUserPassword,
  updateUserBalance,
  setUserBalance,
  getAllUsers,
  updateUserActive,
  createChat,
  getUserChats,
  getChatById,
  addMessage,
  getChatMessages,
  uploadFile,
  getUserFiles,
  addTransaction,
  getUserTransactions,
  getAllTransactions,
} from "./lib/database.js";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./lib/auth.js";
import { getPersonalitySystemPrompt, getAllPersonalities } from "./lib/personalities.js";
import { openaiClient } from "./lib/openai.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// ============ MIDDLEWARE ============

interface AuthRequest extends Request {
  user?: { userId: number; email: string; isAdmin: boolean };
}

function authMiddleware(req: AuthRequest, res: Response, next: (err?: any) => void) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = decoded;
  return next();
}

function adminMiddleware(req: AuthRequest, res: Response, next: (err?: any) => void) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}

// ============ HEALTH CHECK ============

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ============ AUTHENTICATION ENDPOINTS ============

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });

  if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid input types" });
  }

  const existing = getUserByEmail(email);
  if (existing) return res.status(409).json({ error: "User already exists" });

  const passwordHash = hashPassword(password);
  const user = createUser(name, email, passwordHash);

  const token = generateToken({ userId: user.id, email: user.email, isAdmin: !!user.is_admin });

  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, phone, isAdmin: !!user.is_admin },
    token,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const user = getUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.is_active) return res.status(403).json({ error: "User account is inactive" });

  updateLastLogin(user.id);

  const token = generateToken({ userId: user.id, email: user.email, isAdmin: !!user.is_admin });

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: !!user.is_admin,
      isOwner: !!user.is_owner,
    },
    token,
  });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });

  const user = getUserByEmail(email);
  if (!user) return res.status(404).json({ error: "User not found" });

  // In production, send email with reset link
  // For now, return a token that can be used
  const resetToken = generateToken({ userId: user.id, email: user.email, isAdmin: false });

  return res.json({ message: "Password reset email sent", token: resetToken });
});

app.post("/api/auth/reset-password", authMiddleware, (req: AuthRequest, res) => {
  const { newPassword } = req.body;
  if (!newPassword || !req.user) return res.status(400).json({ error: "newPassword and token required" });

  const user = getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const passwordHash = hashPassword(newPassword);
  updateUserPassword(req.user.userId, passwordHash);

  return res.json({ message: "Password reset successfully" });
});

app.get("/api/auth/me", authMiddleware, (req: AuthRequest, res) => {
  const user = getUserById(req.user!.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    plan: user.plan,
    isAdmin: !!user.is_admin,
    isOwner: !!user.is_owner,
    createdAt: user.created_at,
  });
});

// ============ CHAT ENDPOINTS ============

app.get("/api/chat/personalities", authMiddleware, (req: AuthRequest, res) => {
  const personalities = getAllPersonalities();
  return res.json({ personalities });
});

app.post("/api/chat/create", authMiddleware, (req: AuthRequest, res) => {
  const { personality = "general" } = req.body;
  const chatId = createChat(req.user!.userId, personality);
  return res.status(201).json({ chatId, personality });
});

app.get("/api/chat/list", authMiddleware, (req: AuthRequest, res) => {
  const chats = getUserChats(req.user!.userId);
  return res.json({ chats });
});

app.get("/api/chat/:chatId", authMiddleware, (req: AuthRequest, res) => {
  const chat = getChatById(Number(req.params.chatId)) as { user_id: number; personality: string } | null;
  if (!chat || chat.user_id !== req.user!.userId) {
    return res.status(404).json({ error: "Chat not found" });
  }

  const messages = getChatMessages(Number(req.params.chatId));
  return res.json({ chat, messages });
});

app.post("/api/chat/:chatId/message", authMiddleware, async (req: AuthRequest, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "content required" });

  const chat = getChatById(Number(req.params.chatId)) as { user_id: number; personality: string } | null;
  if (!chat || chat.user_id !== req.user!.userId) {
    return res.status(404).json({ error: "Chat not found" });
  }

  // Save user message
  addMessage(Number(req.params.chatId), req.user!.userId, "user", content);

  // Get AI response
  const systemPrompt = getPersonalitySystemPrompt(chat.personality, "ar");
  const messages = getChatMessages(Number(req.params.chatId)).map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));

  try {
    const aiResponse = await openaiClient.chat(messages, systemPrompt);
    addMessage(Number(req.params.chatId), req.user!.userId, "assistant", aiResponse);

    // Deduct credits
    updateUserBalance(req.user!.userId, -10);

    return res.status(201).json({
      messageId: Number(req.params.chatId),
      response: aiResponse,
      creditsRemaining: getUserById(req.user!.userId)?.balance || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to get AI response" });
  }
});

app.post("/api/chat/:chatId/message", authMiddleware, async (req: AuthRequest, res) => {
  const { content, role = "user" } = req.body;
  if (!content) return res.status(400).json({ error: "content required" });

  const chat = getChatById(Number(req.params.chatId)) as { user_id: number; personality: string } | null;
  if (!chat || chat.user_id !== req.user!.userId) {
    return res.status(404).json({ error: "Chat not found" });
  }

  // Save user message
  addMessage(Number(req.params.chatId), req.user!.userId, "user", content);

  // Get AI response
  const systemPrompt = getPersonalitySystemPrompt(chat.personality, "ar");
  const messages = getChatMessages(Number(req.params.chatId)).map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));

  try {
    const aiResponse = await openaiClient.chat(messages, systemPrompt);
    addMessage(Number(req.params.chatId), req.user!.userId, "assistant", aiResponse);

    // Deduct credits
    updateUserBalance(req.user!.userId, -10); // Example: 10 credits per message

    return res.status(201).json({
      messageId: Number(req.params.chatId),
      response: aiResponse,
      creditsRemaining: getUserById(req.user!.userId)?.balance || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to get AI response" });
  }
});

// ============ FILE UPLOAD ENDPOINTS ============

app.post("/api/files/upload", authMiddleware, (req: AuthRequest, res) => {
  const { filename, originalName, fileType, base64Data } = req.body;
  if (!filename || !originalName || !base64Data) {
    return res.status(400).json({ error: "filename, originalName, and base64Data required" });
  }

  const size = Buffer.from(base64Data, "base64").length;
  const fileId = uploadFile(req.user!.userId, filename, originalName, fileType, size);

  // Deduct credits for file upload
  updateUserBalance(req.user!.userId, -50); // Example: 50 credits per file

  return res.status(201).json({ fileId, message: "File uploaded successfully" });
});

app.get("/api/files/list", authMiddleware, (req: AuthRequest, res) => {
  const files = getUserFiles(req.user!.userId);
  return res.json({ files });
});

// ============ WALLET/CREDITS ENDPOINTS ============

app.get("/api/wallet/balance", authMiddleware, (req: AuthRequest, res) => {
  const user = getUserById(req.user!.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ balance: user.balance, plan: user.plan });
});

app.get("/api/wallet/transactions", authMiddleware, (req: AuthRequest, res) => {
  const transactions = getUserTransactions(req.user!.userId);
  return res.json({ transactions });
});

// ============ ADMIN ENDPOINTS ============

app.get("/api/admin/users", authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
  const users = getAllUsers();
  return res.json({ users });
});

app.post("/api/admin/users/:userId/balance", authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (amount === undefined) return res.status(400).json({ error: "amount required" });

  const user = getUserById(Number(req.params.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  updateUserBalance(Number(req.params.userId), amount);
  addTransaction(Number(req.params.userId), "admin_credit", amount, "Admin credit", req.user!.userId);

  return res.json({ message: "Balance updated", newBalance: user.balance + amount });
});

app.post("/api/admin/users/:userId/active", authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
  const { isActive } = req.body;
  if (isActive === undefined) return res.status(400).json({ error: "isActive required" });

  const user = getUserById(Number(req.params.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  updateUserActive(Number(req.params.userId), isActive);
  return res.json({ message: "User status updated", isActive });
});

app.get("/api/admin/transactions", authMiddleware, adminMiddleware, (req: AuthRequest, res) => {
  const transactions = getAllTransactions();
  return res.json({ transactions });
});

export default app;

