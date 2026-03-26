import { integer, sqliteTable, serial, text, timestamp } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

export const TRANSACTION_TYPES = ["deposit", "debit", "refund", "admin-credit", "whatsapp-pending", "whatsapp-confirmed"] as const;

export const transactions = sqliteTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  relatedMessage: integer("related_message"),
  adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
