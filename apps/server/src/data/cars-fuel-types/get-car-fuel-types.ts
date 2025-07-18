import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarFuelTypes(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carFuelTypes, options);
	return result;
}
