import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const packages = sqliteTable(
	"packages",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description").notNull(),
		pricePerDay: integer("price_per_day"), // NOTE: Temporary field
		isAvailable: integer("is_available", { mode: "boolean" })
			.notNull()
			.default(true),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => ({
		nameIdx: index("name_idx").on(table.name),
	}),
);
