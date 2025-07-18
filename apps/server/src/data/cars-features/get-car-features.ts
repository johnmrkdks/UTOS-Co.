import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarFeatures(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carFeatures, options);
	return result;
}
