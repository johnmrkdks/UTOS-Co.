import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { cars } from "./cars";
import { packages } from "./packages";
import { relations, sql } from "drizzle-orm";
import { BookingStatusEnum } from "../enums";

export const bookings = sqliteTable("bookings", {
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
	startDate: integer("start_date", { mode: "timestamp" }).notNull(),
	endDate: integer("end_date", { mode: "timestamp" }).notNull(),
	status: text("status")
		.notNull()
		.$type<BookingStatusEnum>()
		.default(BookingStatusEnum.Pending),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
	user: one(users, { fields: [bookings.userId], references: [users.id] }),
	car: one(cars, { fields: [bookings.carId], references: [cars.id] }),
	package: one(packages, {
		fields: [bookings.packageId],
		references: [packages.id],
	}),
}));
