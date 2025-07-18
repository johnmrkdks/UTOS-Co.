import { getRating } from "@/data/ratings/get-rating";
import type { DB } from "@/db";

export async function getRatingService(db: DB, id: string) {
	const rating = await getRating(db, id);
	return rating;
}
