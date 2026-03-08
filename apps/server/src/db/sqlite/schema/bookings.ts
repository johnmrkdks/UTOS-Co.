import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "@/db/sqlite/schema/users";
import { cars } from "@/db/sqlite/schema/cars";
import { packages } from "@/db/sqlite/schema/packages";
import { relations, sql } from "drizzle-orm";
import { BookingStatusEnum, BookingTypeEnum } from "@/db/sqlite/enums";
import { createId } from "@paralleldrive/cuid2";
import { drivers } from "@/db/sqlite/schema/drivers";
import { bookingStops } from "@/db/sqlite/schema/bookings/booking-stops";
import { bookingExtras } from "@/db/sqlite/schema/bookings/booking-extras";
import { offloadBookingDetails } from "@/db/sqlite/schema/bookings/offload-booking-details";

export const bookings = sqliteTable("bookings", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	referenceNumber: text("reference_number"), // Generated in application code using system settings prefix
	shareToken: text("share_token"), // Unique token for shareable tracking/update links (no auth)
	bookingType: text("booking_type").notNull().$type<BookingTypeEnum>(),

	carId: text("car_id")
		.references(() => cars.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	driverId: text("driver_id").references(() => drivers.id),
	packageId: text("package_id").references(() => packages.id, { onDelete: "cascade" }),

	driverAssignedAt: integer("driver_assigned_at", { mode: "timestamp" }),

	// Route information (for both types)
	originAddress: text("origin_address").notNull(),
	originLatitude: real("origin_latitude"),
	originLongitude: real("origin_longitude"),

	destinationAddress: text("destination_address").notNull(),
	destinationLatitude: real("destination_latitude"),
	destinationLongitude: real("destination_longitude"),

	// Timing
	scheduledPickupTime: integer("scheduled_pickup_time", { mode: "timestamp" }).notNull(),
	timezone: text("timezone"), // Booking-specific timezone (e.g., "Australia/Melbourne"), falls back to system default if null
	estimatedDuration: integer("estimated_duration"), // in seconds
	actualPickupTime: integer("actual_pickup_time", { mode: "timestamp" }),
	actualDropoffTime: integer("actual_dropoff_time", { mode: "timestamp" }),

	// Distance & pricing
	estimatedDistance: real("estimated_distance"), // in kilometers with decimal precision (e.g., 15.5)
	actualDistance: real("actual_distance"), // in kilometers with decimal precision (e.g., 15.5)

	// Pricing (different models for package vs custom) - ALL AMOUNTS IN DOLLARS WITH DECIMAL PRECISION
	quotedAmount: real("quoted_amount").notNull(), // initial quote in dollars (e.g., 45.75)
	finalAmount: real("final_amount"), // actual charged amount in dollars
	baseFare: real("base_fare"), // for custom bookings in dollars
	distanceFare: real("distance_fare"), // for custom bookings in dollars
	timeFare: real("time_fare"), // for custom bookings in dollars
	extraCharges: real("extra_charges").default(0), // extra charges in dollars

	// Customer details
	customerName: text("customer_name").notNull(),
	customerPhone: text("customer_phone").notNull(),
	customerEmail: text("customer_email"),
	passengerCount: integer("passenger_count").notNull().default(1),
	luggageCount: integer("luggage_count").default(0),
	specialRequests: text("special_requests"),
	additionalNotes: text("additional_notes"), // Operational notes for drivers/admins

	status: text("status").notNull().$type<BookingStatusEnum>().default(BookingStatusEnum.Pending),
	isArchived: integer("is_archived", { mode: "boolean" }),

	// Booking timeline tracking
	confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
	driverEnRouteAt: integer("driver_en_route_at", { mode: "timestamp" }),
	serviceStartedAt: integer("service_started_at", { mode: "timestamp" }),
	serviceCompletedAt: integer("service_completed_at", { mode: "timestamp" }),

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
	user: one(users, { fields: [bookings.userId], references: [users.id] }),
	car: one(cars, { fields: [bookings.carId], references: [cars.id] }),
	driver: one(drivers, { fields: [bookings.driverId], references: [drivers.id] }),
	package: one(packages, { fields: [bookings.packageId], references: [packages.id] }),
	stops: many(bookingStops),
	extras: many(bookingExtras),
	offloadDetails: one(offloadBookingDetails, {
		fields: [bookings.id],
		references: [offloadBookingDetails.bookingId],
	}),
}));

// Relations are defined in cars.ts to avoid circular imports

export const bookingStopsRelations = relations(bookingStops, ({ one }) => ({
	booking: one(bookings, { fields: [bookingStops.bookingId], references: [bookings.id] }),
}));
