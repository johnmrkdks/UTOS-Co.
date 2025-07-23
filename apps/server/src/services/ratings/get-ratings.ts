import { getRatings } from "@/data/ratings/get-ratings";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getRatingsService(db: DB, params: ResourceList) {
	const ratings = await getRatings(db, params);
	return ratings;
}
