import { createId } from "@paralleldrive/cuid2";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookings } from "@/db/sqlite/schema/bookings";
import { sql } from "drizzle-orm";

export const bookingStops = sqliteTable("booking_stops", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),

	stopOrder: integer("stop_order").notNull(),
	address: text("address").notNull(),
	latitude: real("latitude"),
	longitude: real("longitude"),

	// Stop details
	estimatedArrival: integer("estimated_arrival", { mode: "timestamp" }),
	actualArrival: integer("actual_arrival", { mode: "timestamp" }),
	waitingTime: integer("waiting_time").default(0), // in minutes
	notes: text("notes"), // special instructions for this stop

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => ({
	orderIdx: index("booking_stops_order_idx").on(table.bookingId, table.stopOrder),
}));
