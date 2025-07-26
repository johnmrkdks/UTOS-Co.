import { createId } from "@paralleldrive/cuid2";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { packages } from "@/db/sqlite/schema/packages";

export const packageRoutes = sqliteTable("package_routes", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	packageId: text("package_id").references(() => packages.id, { onDelete: "cascade" }),
	stopOrder: integer("stop_order").notNull(),
	locationName: text("location_name").notNull(),
	address: text("address").notNull(),
	latitude: real("latitude"),
	longitude: real("longitude"),
	estimatedDuration: integer("estimated_duration"), // minutes at this stop
	isPickupPoint: integer("is_pickup_point", { mode: "boolean" }).default(false),
	isDropoffPoint: integer("is_dropoff_point", { mode: "boolean" }).default(false),
});
