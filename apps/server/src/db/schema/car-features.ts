import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";

export const carFeatures = sqliteTable("car_features", {
	id: text("id").primaryKey(),
	carId: text("car_id")
		.notNull()
		.references(() => cars.id, { onDelete: "cascade", onUpdate: "cascade" }),
	feature: text("feature").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const carFeautesRelations = relations(carFeatures, ({ one }) => ({
	feature: one(carFeatures, {
		fields: [carFeatures.carId],
		references: [carFeatures.id],
	}),
}));
