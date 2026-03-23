import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UserRoleEnum } from "../enums";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	phone: text("phone"), // User's phone number
	timezone: text("timezone"), // User's timezone (auto-detected from browser on signup/first booking)
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),

	// Admin plugin fields
	role: text("role").$type<UserRoleEnum>().notNull().default(UserRoleEnum.User),
	banned: integer("banned", { mode: "boolean" }).default(false),
	banReason: text("ban_reason"),
	banExpires: integer("ban_expires", { mode: "timestamp" }),

	// Anonymous plugin fields
	isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false),
});
