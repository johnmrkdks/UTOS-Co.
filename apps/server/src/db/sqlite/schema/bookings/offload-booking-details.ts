import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookings } from "@/db/sqlite/schema/bookings";

export const offloadBookingDetails = sqliteTable("offload_booking_details", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	bookingId: text("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" })
		.unique(), // One-to-one relationship

	// Offload booking specific fields
	offloaderName: text("offloader_name").notNull(), // Company name for offload bookings
	jobType: text("job_type").notNull(), // Job type for offload bookings
	vehicleType: text("vehicle_type").notNull(), // Vehicle type for offload bookings

	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const offloadBookingDetailsRelations = relations(
	offloadBookingDetails,
	({ one }) => ({
		booking: one(bookings, {
			fields: [offloadBookingDetails.bookingId],
			references: [bookings.id],
		}),
	}),
);
