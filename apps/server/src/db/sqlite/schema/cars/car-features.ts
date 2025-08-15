import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { carsToFeatures } from "../cars-to-features";

export const carFeatures = sqliteTable(
	"car_features",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		name: text("name").notNull().unique(),
		description: text("description"),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	}
);

export const carFeaturesRelations = relations(carFeatures, ({ many }) => ({
	carsToFeatures: many(carsToFeatures),
}));
