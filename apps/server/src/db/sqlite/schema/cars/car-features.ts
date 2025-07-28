import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { cars } from "@/db/sqlite/schema/cars";
import { createId } from "@paralleldrive/cuid2";

export const carFeatures = sqliteTable(
	"car_features",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		name: text("name").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	}
);

export const carFeaturesRelations = relations(carFeatures, ({ many }) => ({
	car: many(cars)
}));
