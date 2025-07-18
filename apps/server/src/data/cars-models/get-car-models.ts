import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarModels(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carModels, options);
	return result;
}
