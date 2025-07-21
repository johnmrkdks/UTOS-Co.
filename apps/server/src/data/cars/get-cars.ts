import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car } from "@/schemas/shared";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type {
	QueryListResult,
	ResourceList,
} from "@/utils/resource-list-schema";

export async function getCars(
	db: DB,
	params: ResourceList,
): Promise<QueryListResult<Car>> {
	const records = await filterPaginationSort(db, cars, params);

	return records;
}
