import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { relations, sql } from "drizzle-orm";
import type { RateableTypeEnum } from "../enums";

export const ratings = sqliteTable("ratings", {
	id: text("id").primaryKey(),
	entityId: text("entity_id").notNull(),
	entityType: text("entity_type").$type<RateableTypeEnum>().notNull(),
	userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
	rating: integer("rating"),
	comment: text("comment"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id],
	}),
}));
