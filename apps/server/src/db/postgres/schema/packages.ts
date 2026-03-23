import {
	boolean,
	index,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const packages = pgTable(
	"packages",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description").notNull(),
		pricePerDay: real("price_per_day"), // NOTE: Temporary field
		isAvailable: boolean("is_available").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		nameIdx: index("name_idx").on(table.name),
	}),
);
