import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { createId } from "@paralleldrive/cuid2";

export const carDriveTypes = sqliteTable("car_drive_types", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const carDriveTypesRelations = relations(carDriveTypes, ({ many }) => ({
	cars: many(cars),
}));
