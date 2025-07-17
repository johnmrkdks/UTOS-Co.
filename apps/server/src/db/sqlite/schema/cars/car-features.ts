import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";

export const carFeatures = sqliteTable(
	"car_features",
	{
		id: text("id").primaryKey(),
		carId: text("car_id")
			.notNull()
			.references(() => cars.id, { onDelete: "cascade", onUpdate: "cascade" }),
		feature: text("feature").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => ({
		carIdx: index("car_features_car_idx").on(table.carId),
	}),
);

export const carFeaturesRelations = relations(carFeatures, ({ one }) => ({
	car: one(cars, {
		fields: [carFeatures.carId],
		references: [cars.id],
	}),
}));
