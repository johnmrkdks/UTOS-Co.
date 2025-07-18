import { deleteRating } from "@/data/ratings/delete-rating";
import type { DB } from "@/db";

export async function deleteRatingService(db: DB, id: string) {
	const deletedRating = await deleteRating(db, id);
	return deletedRating;
}
