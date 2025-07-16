import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { cars } from "./cars";
import { users } from "./users";

export const drivers = pgTable("drivers", {
	id: text("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	licenseNumber: text("license_number").notNull(),
	carId: text("car_id").references(() => cars.id, { onDelete: "cascade" }),
	isActive: boolean("is_active").notNull().default(true),
	isApproved: boolean("is_approved").notNull().default(false),
	createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const driversRelations = relations(drivers, ({ one }) => ({
	user: one(users, { fields: [drivers.userId], references: [users.id] }),
	car: one(cars, { fields: [drivers.carId], references: [cars.id] }),
}));
