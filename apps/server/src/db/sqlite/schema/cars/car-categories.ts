import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const carCategories = sqliteTable(
	"car_categories",
	{
		id: text("id").primaryKey().$defaultFn(() => createId()),
		name: text("name").notNull(), // "Economy", "Standard", "Premium", "Luxury"
		description: text("description"),

		// Pricing multiplier for this category
		priceMultiplier: real("price_multiplier").notNull().default(1.0),

		// Display configuration
		displayOrder: integer("display_order").default(0),
		color: text("color"), // UI color for category
		icon: text("icon"), // Icon name/path

		// Capacity constraints
		minSeatingCapacity: integer("min_seating_capacity").default(2),
		maxSeatingCapacity: integer("max_seating_capacity").default(8),

		// Availability
		isActive: integer("is_active", { mode: "boolean" }).default(true),

		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => ({
		nameIdx: index("car_categories_name_idx").on(table.name),
		orderIdx: index("car_categories_order_idx").on(table.displayOrder),
	}),
);
