import { integer, sqliteTable, serial, text, timestamp } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "./users";

export const PERSONA_TYPES = ["defense-lawyer", "legal-analyst", "judge-vision", "quick-consultation", "smart-mufti"] as const;

export const conversations = sqliteTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  personaType: text("persona_type").notNull().default("defense-lawyer"), // defense-lawyer, legal-analyst, etc.
  messageCount: integer("message_count").notNull().default(0),
  totalCreditsUsed: integer("total_credits_used").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    personaType: z.enum(PERSONA_TYPES),
  });

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type PersonaType = (typeof PERSONA_TYPES)[number];
