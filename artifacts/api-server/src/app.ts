import express from "express";
import cors from "cors";
import { getUserByEmail, createUser, updateLastLogin } from "./lib/database.js";
import { hashPassword, verifyPassword, generateToken } from "./lib/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "name, email, password required" });

  if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid input types" });
  }

  const existing = getUserByEmail(email);
  if (existing) return res.status(409).json({ error: "User already exists" });

  const passwordHash = hashPassword(password);
  const user = createUser(name, email, passwordHash);

  const token = generateToken({ userId: user.id, email: user.email, isAdmin: !!user.is_admin });

  return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin }, token });
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

  return res.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin, isOwner: !!user.is_owner }, token });
});

export default app;
