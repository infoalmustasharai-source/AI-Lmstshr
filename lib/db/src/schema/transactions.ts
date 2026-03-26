import { integer, sqliteTable, serial, text, timestamp } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { users } from "./users";

export const TRANSACTION_TYPES = ["deposit", "debit", "refund", "admin-credit", "whatsapp-pending", "whatsapp-confirmed"] as const;

export const transactions = sqliteTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "deposit" | "debit" | "refund" | "admin-credit"
  description: text("description"),
  relatedMessage: integer("related_message"), // For debit transactions - reference to message ID
  adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }), // Who performed this transaction
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, createdAt: true })
  .extend({
    type: z.enum(TRANSACTION_TYPES),
  });

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
