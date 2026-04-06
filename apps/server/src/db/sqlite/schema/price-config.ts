import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { cars } from "./cars";

export const pricingConfig = sqliteTable(
	"pricing_configs",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),

		// Pricing model name
		name: text("name").notNull(), // "Standard", "Premium", etc.

		// Car-specific pricing (null = global config, specific carId = per-car config)
		carId: text("car_id").references(() => cars.id, { onDelete: "cascade" }),

		// Flexible pricing structure
		firstKmRate: real("first_km_rate").notNull(), // Rate for first X kilometers
		firstKmLimit: real("first_km_limit").default(10), // Configurable limit (default 10km)
		pricePerKm: real("price_per_km").notNull().default(4.85), // Rate for distance above firstKmLimit

		/** Optional hourly rate for this vehicle (instant quote / hourly package bookings) */
		hourlyRate: real("hourly_rate"),

		// Applicability
		carTypeId: text("car_type_id"), // if pricing varies by car type

		createdAt: real("created_at").default(sql`(unixepoch())`),
		updatedAt: real("updated_at").default(sql`(unixepoch())`),
	},
	(table) => ({
		carIdIdx: index("pricing_configs_car_id_idx").on(table.carId),
	}),
);

export const pricingConfigRelations = relations(pricingConfig, ({ one }) => ({
	car: one(cars, {
		fields: [pricingConfig.carId],
		references: [cars.id],
	}),
}));
