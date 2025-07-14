import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { UserRoleEnum } from "../enums";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),

	// Admin plugin fields
	role: text("role")
		.$type<UserRoleEnum>()
		.notNull()
		.default(UserRoleEnum.Customer),
	banned: integer("banned", { mode: "boolean" }).default(false),
	banReason: text("ban_reason"),
	banExpires: integer("ban_expires", { mode: "timestamp" }),
});
