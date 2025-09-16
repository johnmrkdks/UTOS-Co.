import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { packageCategories } from "./packages/package-categories";
import { packageServiceTypes } from "./packages/package-service-types";

export const packages = sqliteTable("packages", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	name: text("name").notNull(), // "Airport Transfer", "City Tour", etc.
	description: text("description").notNull(),

	categoryId: text("category_id").references(() => packageCategories.id),
	serviceTypeId: text("service_type_id").references(() => packageServiceTypes.id).notNull(),

	// Package image
	bannerImageUrl: text("banner_image_url"), // URL for package banner image

	// Service specifications
	duration: integer("duration"), // in minutes (null for transfers)
	maxDistance: integer("max_distance"), // in km (null if unlimited)

	// Pricing (based on service type rate type)
	fixedPrice: integer("fixed_price"), // in cents (for fixed rate packages)
	hourlyRate: integer("hourly_rate"), // in cents per hour (for hourly rate packages)
	extraKmPrice: integer("extra_km_price"), // if distance exceeds maxDistance
	extraHourPrice: integer("extra_hour_price"), // if duration exceeds planned
	depositRequired: integer("deposit_required"), // in cents

	// Service constraints
	maxPassengers: integer("max_passengers").default(4),
	advanceBookingHours: integer("advance_booking_hours").default(24), // minimum notice
	cancellationHours: integer("cancellation_hours").default(24), // cancellation policy

	// Included services
	includesDriver: integer("includes_driver", { mode: "boolean" }).default(true),
	includesFuel: integer("includes_fuel", { mode: "boolean" }).default(true),
	includesTolls: integer("includes_tolls", { mode: "boolean" }).default(false),
	includesWaiting: integer("includes_waiting", { mode: "boolean" }).default(false),
	waitingTimeMinutes: integer("waiting_time_minutes").default(0),

	// Availability
	isAvailable: integer("is_available", { mode: "boolean" }).default(true),
	isPublished: integer("is_published", { mode: "boolean" }).default(false), // Public visibility for customers
	availableDays: text("available_days"), // JSON: ["monday", "tuesday", ...] or null for all days
	availableTimeStart: text("available_time_start"), // "09:00" or null for anytime
	availableTimeEnd: text("available_time_end"), // "17:00" or null for anytime

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
	nameIdx: index("packages_name_idx").on(table.name),
	publishedAvailabilityIdx: index("packages_published_availability_idx").on(table.isPublished, table.isAvailable),
}));
