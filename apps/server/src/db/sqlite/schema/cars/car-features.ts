import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { createId } from "@paralleldrive/cuid2";

export const carFeatures = sqliteTable(
	"car_features",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		carId: text("car_id")
			.notNull()
			.references(() => cars.id, { onDelete: "cascade", onUpdate: "cascade" }),
		feature: text("feature").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	}
);

export const carFeaturesRelations = relations(carFeatures, ({ one }) => ({
	car: one(cars, {
		fields: [carFeatures.carId],
		references: [cars.id],
	}),
}));
