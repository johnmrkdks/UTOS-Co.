import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cars } from "./cars";
import { users } from "./users";
import { createId } from "@paralleldrive/cuid2";

export const drivers = sqliteTable("drivers", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	userId: text("user_id").references(() => users.id),
	licenseNumber: text("license_number").notNull(),
	carId: text("car_id").references(() => cars.id, { onDelete: "cascade" }),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	isApproved: integer("is_approved", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const driversRelations = relations(drivers, ({ one }) => ({
	user: one(users, { fields: [drivers.userId], references: [users.id] }),
	car: one(cars, { fields: [drivers.carId], references: [cars.id] }),
}));
