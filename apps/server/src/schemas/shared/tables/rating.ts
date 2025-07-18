import { RateableTypeEnum } from "@/db/sqlite/enums";
import { ratings } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { UserSchema } from "./user";

export const RatingSchema = createSelectSchema(ratings).extend({
	user: UserSchema.optional(),
});
export const InsertRatingSchema = createInsertSchema(ratings, {
	entityType: z.nativeEnum(RateableTypeEnum),
});
export const UpdateRatingSchema = createUpdateSchema(ratings, {
	rateableType: z.nativeEnum(RateableTypeEnum).optional(),
});

export type Rating = z.infer<typeof RatingSchema>;
export type InsertRating = z.infer<typeof InsertRatingSchema>;
export type UpdateRating = z.infer<typeof UpdateRatingSchema>;
