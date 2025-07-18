import type { DB } from "@/db";
import { ratings } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getRatings(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, ratings, options);
	return result;
}
