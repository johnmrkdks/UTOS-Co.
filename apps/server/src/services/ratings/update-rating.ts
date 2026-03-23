import { z } from "zod";
import { getRatingById } from "@/data/ratings/get-rating-by-id";
import { updateRating } from "@/data/ratings/update-rating";
import type { DB } from "@/db";
import { UpdateRatingSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateRatingServiceSchema = z.object({
	id: z.string(),
	data: UpdateRatingSchema,
});

export type UpdateRatingParams = z.infer<typeof UpdateRatingServiceSchema>;

export async function updateRatingService(
	db: DB,
	{ id, data }: UpdateRatingParams,
) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	const updatedRating = await updateRating(db, { id, data });

	return updatedRating;
}
