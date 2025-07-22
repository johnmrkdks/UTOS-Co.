import { getRatingById } from "@/data/ratings/get-rating-by-id";
import { updateRating } from "@/data/ratings/update-rating";
import type { DB } from "@/db";
import { UpdateRatingSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const UpdateRatingServiceSchema = z.object({
	id: z.string(),
	data: UpdateRatingSchema,
});

export async function updateRatingService(db: DB, { id, data }: z.infer<typeof UpdateRatingServiceSchema>) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	const updatedRating = await updateRating(db, { id, data });

	return updatedRating;
}
