import { getRatingById } from "@/data/ratings/get-rating-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetRatingServiceSchema = z.object({
	id: z.string(),
});

export type GetRatingByIdParams = z.infer<typeof GetRatingServiceSchema>;

export async function getRatingService(db: DB, { id }: GetRatingByIdParams) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	return rating;
}
