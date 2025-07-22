import { getRatingById } from "@/data/ratings/get-rating-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetRatingServiceSchema = z.object({
	id: z.string(),
});

export async function getRatingService(db: DB, { id }: z.infer<typeof GetRatingServiceSchema>) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	return rating;
}
