import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { conversations } from "./conversations.js";

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  creditsUsed: integer("credits_used").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).defaultNow().notNull(),
});
