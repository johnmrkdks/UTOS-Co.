import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { bookings } from "@/db/sqlite/schema/bookings";

export const bookingExtras = sqliteTable("booking_extras", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	bookingId: text("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),

	// Wait times (in minutes)
	additionalWaitTime: integer("additional_wait_time").default(0),

	// Charges (in cents)
	unscheduledStops: integer("unscheduled_stops").default(0),
	parkingCharges: integer("parking_charges").default(0),
	tollCharges: integer("toll_charges").default(0),
	tollLocation: text("toll_location"), // where tolls were taken
	
	// Other charges
	otherChargesDescription: text("other_charges_description"),
	otherChargesAmount: integer("other_charges_amount").default(0),
	
	// Extra type classification
	extraType: text("extra_type").notNull().$type<'general' | 'driver' | 'operator'>().default('general'),
	
	// Additional notes
	notes: text("notes"),
	
	// Total calculated extras
	totalExtraAmount: integer("total_extra_amount").notNull().default(0),

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const bookingExtrasRelations = relations(bookingExtras, ({ one }) => ({
	booking: one(bookings, { fields: [bookingExtras.bookingId], references: [bookings.id] }),
}));

export type BookingExtra = typeof bookingExtras.$inferSelect;
export type NewBookingExtra = typeof bookingExtras.$inferInsert;