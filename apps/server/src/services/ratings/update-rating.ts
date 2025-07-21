import { updateRating } from "@/data/ratings/update-rating";
import type { DB } from "@/db";
import type { UpdateRating } from "@/schemas/shared";

type UpdateRatingParams = {
	id: string;
	data: UpdateRating;
};

export async function updateRatingService(db: DB, { id, data }: UpdateRatingParams) {
	const updatedRating = await updateRating(db, { id, data });

	return updatedRating;
}
