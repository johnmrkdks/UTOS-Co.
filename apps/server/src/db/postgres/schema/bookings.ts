import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { cars } from "./cars";
import { packages } from "./packages";
import { relations } from "drizzle-orm";

export const bookings = pgTable("bookings", {
	id: text("id").primaryKey(),
	carId: text("car_id")
		.notNull()
		.references(() => cars.id, { onDelete: "cascade" }),
	packageId: text("package_id")
		.notNull()
		.references(() => packages.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	startDate: timestamp("start_date", { mode: "date" }).notNull(),
	endDate: timestamp("end_date", { mode: "date" }).notNull(),
	status: text("status")
		.notNull()
		.$type<"pending" | "confirmed" | "canceled">(),
	createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
	user: one(users, { fields: [bookings.userId], references: [users.id] }),
	car: one(cars, { fields: [bookings.carId], references: [cars.id] }),
	package: one(packages, {
		fields: [bookings.packageId],
		references: [packages.id],
	}),
}));
