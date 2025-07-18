import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarTransmissionTypes(db: DB, options: ResourceList) {
	const result = await filterPaginationSort(db, carTransmissionTypes, options);
	return result;
}
