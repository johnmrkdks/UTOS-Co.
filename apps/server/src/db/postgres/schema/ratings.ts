import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations, sql } from "drizzle-orm";
import { rateableTypeEnum } from "./enums";

export const ratings = pgTable("ratings", {
	id: text("id").primaryKey(),
	entityId: text("entity_id").notNull(),
	entityType: rateableTypeEnum("entity_type").notNull(),
	userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
	rating: integer("rating"),
	comment: text("comment"),
	createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id],
	}),
}));
