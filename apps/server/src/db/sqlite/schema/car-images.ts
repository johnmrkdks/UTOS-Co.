import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";

export const carImages = sqliteTable("car_images", {
	id: text("id").primaryKey(),
	carId: text("car_id")
		.notNull()
		.references(() => cars.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	url: text("url").notNull(),
	order: integer("order").default(0),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const carImagesRelations = relations(carImages, ({ one }) => ({
	image: one(cars, {
		fields: [carImages.carId],
		references: [cars.id],
	}),
}));
