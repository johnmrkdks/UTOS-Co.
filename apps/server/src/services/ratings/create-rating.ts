import type { z } from "zod";
import { createRating } from "@/data/ratings/create-rating";
import type { DB } from "@/db";
import {
	type InsertRating,
	InsertRatingSchema,
	type Rating,
} from "@/schemas/shared";

export const CreateRatingServiceSchema = InsertRatingSchema;

export type CreateRatingParams = z.infer<typeof CreateRatingServiceSchema>;

export async function createRatingService(db: DB, data: CreateRatingParams) {
	const newRating = createRating(db, data);

	return newRating;
}
