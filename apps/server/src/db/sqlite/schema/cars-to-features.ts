import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";
import { carFeatures } from "./cars/car-features";

export const carsToFeatures = sqliteTable("cars_to_features", {
	carId: text("car_id")
		.notNull()
		.references(() => cars.id, { onDelete: "cascade" }),
	featureId: text("feature_id")
		.notNull()
		.references(() => carFeatures.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const carsToFeaturesRelations = relations(carsToFeatures, ({ one }) => ({
	car: one(cars, {
		fields: [carsToFeatures.carId],
		references: [cars.id],
	}),
	feature: one(carFeatures, {
		fields: [carsToFeatures.featureId],
		references: [carFeatures.id],
	}),
}));
