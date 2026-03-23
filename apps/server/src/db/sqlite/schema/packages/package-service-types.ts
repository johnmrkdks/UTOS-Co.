import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RateTypeEnum } from "../../enums";

export const packageServiceTypes = sqliteTable("package_service_types", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text("name").notNull().unique(), // "Transfer", "Tour", "Event", "Hourly"
	description: text("description"),
	icon: text("icon"), // Icon name or emoji for UI
	rateType: text("rate_type", {
		enum: [RateTypeEnum.Fixed, RateTypeEnum.Hourly],
	})
		.notNull()
		.default(RateTypeEnum.Fixed), // Rate type: fixed price or hourly rate
	isActive: integer("is_active", { mode: "boolean" }).default(true),
	displayOrder: integer("display_order").default(0),

	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
});
