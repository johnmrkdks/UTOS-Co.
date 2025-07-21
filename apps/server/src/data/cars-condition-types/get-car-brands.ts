import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type { CarBrand } from "@/schemas/shared";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { QueryListResult, ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrands(
	db: DB,
	params: ResourceList,
): Promise<QueryListResult<CarBrand>> {
	const records = await filterPaginationSort(db, carBrands, params);

	return records;
}
