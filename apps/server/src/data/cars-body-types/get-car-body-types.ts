import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarBodyTypes(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carBodyTypes, options);
	return result;
}
