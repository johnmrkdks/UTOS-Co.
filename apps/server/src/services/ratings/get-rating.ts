import { getRatingById } from "@/data/ratings/get-rating-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getRatingService(db: DB, id: string) {
	const rating = await getRatingById(db, id);

	if (!rating) {
		throw ErrorFactory.notFound("Rating not found.");
	}

	return rating;
}
