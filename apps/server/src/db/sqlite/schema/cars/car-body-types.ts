import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";

export const bodyTypes = sqliteTable("body_types", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const bodyTypesRelations = relations(bodyTypes, ({ many }) => ({
	cars: many(cars),
}));
