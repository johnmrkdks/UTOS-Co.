/**
 * Payment state per booking - Square authorization + capture flow.
 * Amounts in cents (Square uses smallest currency unit).
 */
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookings } from "@/db/sqlite/schema/bookings";
import { paymentMethods } from "./payment-methods";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

/** Payment status for booking_payments */
export type BookingPaymentStatus =
	| "pending_authorization"
	| "authorized"
	| "captured"
	| "voided"
	| "failed"
	| "refunded";

export const bookingPayments = sqliteTable("booking_payments", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	bookingId: text("booking_id")
		.notNull()
		.unique()
		.references(() => bookings.id, { onDelete: "cascade" }),

	// Square payment references
	squarePaymentId: text("square_payment_id").notNull(),
	squareOrderId: text("square_order_id"), // Optional - if using Orders API

	// Amounts in cents (Square smallest unit)
	authorizedAmountCents: integer("authorized_amount_cents").notNull(),
	capturedAmountCents: integer("captured_amount_cents"),
	finalAmountCents: integer("final_amount_cents"), // Final amount to capture (may differ if extras added)

	status: text("status").notNull().$type<BookingPaymentStatus>(),

	// Payment source - for saved card or one-time token
	paymentMethodId: text("payment_method_id").references(() => paymentMethods.id, { onDelete: "set null" }),
	squareSourceId: text("square_source_id"), // Token or card ID used for authorization

	// Idempotency - prevent duplicate captures
	idempotencyKey: text("idempotency_key"),
	capturedAt: integer("captured_at", { mode: "timestamp" }),

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const bookingPaymentsRelations = relations(bookingPayments, ({ one }) => ({
	booking: one(bookings, { fields: [bookingPayments.bookingId], references: [bookings.id] }),
	paymentMethod: one(paymentMethods, { fields: [bookingPayments.paymentMethodId], references: [paymentMethods.id] }),
}));
