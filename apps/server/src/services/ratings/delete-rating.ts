import { z } from "zod";
import { deleteRating } from "@/data/ratings/delete-rating";
import { getRatingById } from "@/data/ratings/get-rating-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const DeleteRatingServiceSchema = z.object({
	id: z.string(),
});

export type DeleteRatingParams = z.infer<typeof DeleteRatingServiceSchema>;

export async function deleteRatingService(db: DB, { id }: DeleteRatingParams) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	const deletedRating = await deleteRating(db, id);
	return deletedRating;
}
