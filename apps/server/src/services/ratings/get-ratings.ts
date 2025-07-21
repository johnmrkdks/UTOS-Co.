import { getRatings } from "@/data/ratings/get-ratings";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getRatingsService(db: DB, options: ResourceList) {
	const ratings = await getRatings(db, options);
	return ratings;
}
