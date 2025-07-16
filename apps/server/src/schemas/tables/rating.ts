import { ratings } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const RatingSchema = createSelectSchema(ratings);
export const InsertRatingSchema = createInsertSchema(ratings);
export const UpdateRatingSchema = createUpdateSchema(ratings);

export type Rating = z.infer<typeof RatingSchema>;
export type InsertRating = z.infer<typeof InsertRatingSchema>;
export type UpdateRating = z.infer<typeof UpdateRatingSchema>;
