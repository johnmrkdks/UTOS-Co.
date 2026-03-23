import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const packageCategories = sqliteTable("package_categories", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text("name").notNull(), // "Transfers", "Tours", "Events"
	description: text("description"),
	displayOrder: integer("display_order").default(0),
});
