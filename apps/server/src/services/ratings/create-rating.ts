import { createRating } from "@/data/ratings/create-rating";
import type { DB } from "@/db";
import type { Rating, InsertRating } from "@/schemas/shared/tables/rating";

export async function createRatingService(db: DB, data: InsertRating): Promise<Rating> {
	const newRating = createRating(db, data);

	return newRating;
}
