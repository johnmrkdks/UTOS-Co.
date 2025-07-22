import { createRating } from "@/data/ratings/create-rating";
import type { DB } from "@/db";
import { type Rating, type InsertRating, InsertRatingSchema } from "@/schemas/shared";
import { z } from "zod";

export const CreateRatingServiceSchema = z.object({
	data: InsertRatingSchema
});

export async function createRatingService(db: DB, { data }: z.infer<typeof CreateRatingServiceSchema>) {
	const newRating = createRating(db, data);

	return newRating;
}
