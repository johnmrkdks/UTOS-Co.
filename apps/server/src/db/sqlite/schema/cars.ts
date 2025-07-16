import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { carImages } from "./car-images";
import { carFeatures } from "./car-features";

export const cars = sqliteTable("cars", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	dateManufactured: integer("date_manufactured", {
		mode: "timestamp",
	}).notNull(),
	make: text("make").notNull(),
	model: text("model").notNull(),
	mileage: integer("mileage").notNull(),
	color: text("color").notNull(),
	pricePerDay: integer("price_per_day"),
	pricePerKm: integer("price_per_km"),
	isForDelivery: integer("is_for_delivery", { mode: "boolean" })
		.notNull()
		.default(false),
	isAvailable: integer("is_available", { mode: "boolean" })
		.notNull()
		.default(false),
	isForHire: integer("is_for_hire", { mode: "boolean" })
		.notNull()
		.default(false),
	isForRent: integer("is_for_rent", { mode: "boolean" })
		.notNull()
		.default(false),
	bodyType: text("body_type").notNull(),
	fuelType: text("fuel_type").notNull(),
	transmission: text("transmission").notNull(),
	driveType: text("drive_type").notNull(),
	condition: text("condition").notNull(),
	engineSize: integer("engine_size").notNull(),
	doors: integer("doors").notNull(),
	cylinders: integer("cylinders").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`(CURRENT_TIMESTAMP)`,
	),
});

export const carsRelations = relations(cars, ({ many }) => ({
	images: many(carImages),
	features: many(carFeatures),
}));
