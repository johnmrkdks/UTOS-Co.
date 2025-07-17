import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";

export const driveTypes = sqliteTable("drive_types", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const driveTypesRelations = relations(driveTypes, ({ many }) => ({
	cars: many(cars),
}));
