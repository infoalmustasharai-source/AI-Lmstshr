import { integer, sqliteTable, serial, text, timestamp } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

export const PERSONA_TYPES = ["defense-lawyer", "legal-analyst", "judge-vision", "quick-consultation", "smart-mufti"] as const;

export const conversations = sqliteTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  personaType: text("persona_type").notNull().default("defense-lawyer"),
  messageCount: integer("message_count").notNull().default(0),
  totalCreditsUsed: integer("total_credits_used").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
