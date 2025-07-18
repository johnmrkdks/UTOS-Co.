import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarImages(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carImages, options);
	return result;
}
