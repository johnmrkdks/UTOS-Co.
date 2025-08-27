import { createId } from "@paralleldrive/cuid2";
import { sql, relations } from "drizzle-orm";
import { integer, real, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";

export const pricingConfig = sqliteTable("pricing_configs", {
	id: text("id").primaryKey().$defaultFn(() => createId()),

	// Pricing model name
	name: text("name").notNull(), // "Standard", "Premium", "Night"

	// Car-specific pricing (null = global config, specific carId = per-car config)
	carId: text("car_id").references(() => cars.id, { onDelete: "cascade" }),
	
	// Base pricing
	baseFare: integer("base_fare").notNull(), // minimum charge per car or global
	pricePerKm: integer("price_per_km").notNull(), // per kilometer
	pricePerMinute: integer("price_per_minute"), // time-based component

	// Distance tiers (optional - for graduated pricing)
	firstKmRate: integer("first_km_rate"), // first X km at different rate
	firstKmLimit: integer("first_km_limit").default(5),

	// Time-based multipliers
	peakHourMultiplier: real("peak_hour_multiplier").default(1.0), // rush hour
	nightMultiplier: real("night_multiplier").default(1.2), // night surcharge
	weekendMultiplier: real("weekend_multiplier").default(1.0),

	// Additional charges
	waitingChargePerMinute: integer("waiting_charge_per_minute").default(0),
	stopCharge: integer("stop_charge").default(0), // per additional stop
	cancellationFee: integer("cancellation_fee").default(0),

	// Time ranges for multipliers
	peakHourStart: text("peak_hour_start"), // "07:00"
	peakHourEnd: text("peak_hour_end"), // "09:00"
	nightHourStart: text("night_hour_start"), // "22:00"  
	nightHourEnd: text("night_hour_end"), // "06:00"

	// Applicability
	carTypeId: text("car_type_id"), // if pricing varies by car type
	isActive: integer("is_active", { mode: "boolean" }).default(true),

	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
	carIdIdx: index("pricing_configs_car_id_idx").on(table.carId),
	carActiveIdx: index("pricing_configs_car_active_idx").on(table.carId, table.isActive),
}));

export const pricingConfigRelations = relations(pricingConfig, ({ one }) => ({
	car: one(cars, {
		fields: [pricingConfig.carId],
		references: [cars.id],
	}),
}));
