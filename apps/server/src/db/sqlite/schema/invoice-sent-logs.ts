import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const invoiceSentLogs = sqliteTable("invoice_sent_logs", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	type: text("type", { enum: ["driver", "company"] }).notNull(),
	recipientName: text("recipient_name").notNull(),
	recipientEmail: text("recipient_email").notNull(),
	periodStart: integer("period_start", { mode: "timestamp" }).notNull(),
	periodEnd: integer("period_end", { mode: "timestamp" }).notNull(),
	sentByUserId: text("sent_by_user_id").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export type InvoiceSentLog = typeof invoiceSentLogs.$inferSelect;
export type NewInvoiceSentLog = typeof invoiceSentLogs.$inferInsert;
