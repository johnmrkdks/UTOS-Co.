import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { carModels } from "./car-models";

export const carBrands = sqliteTable("car_brands", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const carBrandsRelations = relations(carBrands, ({ many }) => ({
	models: many(carModels),
}));
