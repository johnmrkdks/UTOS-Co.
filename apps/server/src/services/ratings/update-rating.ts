import { updateRating } from "@/data/ratings/update-rating";
import type { DB } from "@/db";
import type { UpdateRating } from "@/schemas/shared/tables/rating";

export async function updateRatingService(db: DB, id: string, data: UpdateRating) {
	const updatedRating = await updateRating(db, id, data);

	return updatedRating;
}
