import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { createId } from "@paralleldrive/cuid2";

export const carImages = sqliteTable(
	"car_images",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		carId: text("car_id")
			.notNull()
			.references(() => cars.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		url: text("url").notNull(),
		altText: text("alt_text"), // for accessibility
		order: integer("order").notNull().default(0),
		isMain: integer("is_main", { mode: "boolean" }).default(false),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => ({
		orderIdx: index("car_images_order_idx").on(table.carId, table.order),
	}),
);

export const carImagesRelations = relations(carImages, ({ one }) => ({
	car: one(cars, {
		fields: [carImages.carId],
		references: [cars.id],
	}),
}));
