import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarDriveTypes(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carDriveTypes, options);
	return result;
}
