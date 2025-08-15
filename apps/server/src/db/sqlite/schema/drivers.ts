import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";
import { users } from "./users";
import { createId } from "@paralleldrive/cuid2";

export const drivers = sqliteTable("drivers", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	userId: text("user_id").references(() => users.id),
	licenseNumber: text("license_number").notNull(),
	licenseExpiry: integer("license_expiry", { mode: "timestamp" }).notNull(),

	// Availability
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	isApproved: integer("is_approved", { mode: "boolean" })
		.notNull()
		.default(false),
	isAvailable: integer("is_available", { mode: "boolean" }).default(true),

	// Performance tracking
	rating: real("rating").default(5.0),
	totalRides: integer("total_rides").default(0),

	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});

export const driversRelations = relations(drivers, ({ one }) => ({
	user: one(users, { fields: [drivers.userId], references: [users.id] }),
}));
