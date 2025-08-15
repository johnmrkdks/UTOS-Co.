import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { createId } from '@paralleldrive/cuid2';

export const carBodyTypes = sqliteTable("car_body_types", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),

});

export const carBodyTypesRelations = relations(carBodyTypes, ({ many }) => ({
	cars: many(cars),
}));
