import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";

export const carConditionTypes = sqliteTable("car_condition_types", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const carConditionTypesRelations = relations(
	carConditionTypes,
	({ many }) => ({
		cars: many(cars),
	}),
);
