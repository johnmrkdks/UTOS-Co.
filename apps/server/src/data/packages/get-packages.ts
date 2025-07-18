import type { DB } from "@/db";
import { packages } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getPackages(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, packages, options);
	return result;
}
