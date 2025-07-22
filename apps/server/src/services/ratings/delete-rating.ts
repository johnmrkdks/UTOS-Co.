import { deleteRating } from "@/data/ratings/delete-rating";
import { getRatingById } from "@/data/ratings/get-rating-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteRatingService(db: DB, id: string) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	const deletedRating = await deleteRating(db, id);
	return deletedRating;
}
