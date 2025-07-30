import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, unique } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { carBrands } from "./car-brands";
import { createId } from "@paralleldrive/cuid2";

export const carModels = sqliteTable("car_models", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	brandId: text("brand_id")
		.notNull()
		.references(() => carBrands.id, { onDelete: "restrict" }),
	name: text("name").notNull(),
	year: integer("year").notNull(),
	generation: text("generation"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
},
	(table) => ({
		brandModelYearUnique: unique().on(table.brandId, table.name, table.year),
	}),
);

export const carModelsRelations = relations(carModels, ({ one, many }) => ({
	brand: one(carBrands, {
		fields: [carModels.brandId],
		references: [carBrands.id],
	}),
	cars: many(cars),
}));
