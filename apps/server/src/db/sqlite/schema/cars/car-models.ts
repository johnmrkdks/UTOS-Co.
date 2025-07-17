import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { carBrands } from "./car-brands";

export const carModels = sqliteTable("car_models", {
	id: text("id").primaryKey(),
	brandId: text("brand_id")
		.notNull()
		.references(() => carBrands.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const carModelsRelations = relations(carModels, ({ one, many }) => ({
	brand: one(carBrands, {
		fields: [carModels.brandId],
		references: [carBrands.id],
	}),
	cars: many(cars),
}));
