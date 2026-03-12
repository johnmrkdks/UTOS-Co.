/**
 * Saved payment methods for registered users (Square Cards on File).
 * Never store raw card data - only Square IDs and last4/brand for display.
 */
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "@/db/sqlite/schema/users";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const paymentMethods = sqliteTable("payment_methods", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	// Square references - never store raw card data
	squareCustomerId: text("square_customer_id"), // Square Customer ID (for Cards API)
	squareCardId: text("square_card_id"), // Card on file ID from Square

	// Display-only (from Square)
	last4: text("last_4"),
	brand: text("brand"), // e.g. "VISA", "MASTERCARD"

	isDefault: integer("is_default", { mode: "boolean" }).default(false),

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
	user: one(users, { fields: [paymentMethods.userId], references: [users.id] }),
}));
