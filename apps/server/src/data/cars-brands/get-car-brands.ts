import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrands(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carBrands, options);
	return result;
}
