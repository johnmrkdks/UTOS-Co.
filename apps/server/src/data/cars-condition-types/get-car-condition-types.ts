import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarConditionTypes(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carConditionTypes, options);
	return result;
}
