import { getRatingById } from "@/data/ratings/get-rating-by-id";
import { updateRating } from "@/data/ratings/update-rating";
import type { DB } from "@/db";
import type { UpdateRating } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

type UpdateRatingParams = {
	id: string;
	data: UpdateRating;
};

export async function updateRatingService(db: DB, { id, data }: UpdateRatingParams) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	const updatedRating = await updateRating(db, { id, data });

	return updatedRating;
}
