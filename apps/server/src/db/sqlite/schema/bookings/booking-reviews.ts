import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookings } from "../bookings";

export const bookingReviews = sqliteTable("booking_reviews", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	bookingId: text("booking_id").references(() => bookings.id, {
		onDelete: "cascade",
	}),
	serviceRating: integer("service_rating").notNull(), // 1-5
	driverRating: integer("driver_rating").notNull(), // 1-5
	vehicleRating: integer("vehicle_rating").notNull(), // 1-5
	review: text("review"),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});
