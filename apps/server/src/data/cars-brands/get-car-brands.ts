import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { filterPaginationSort } from "@/utils/filter-pagination-sort";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrands(db: DB, options: ResourceList) {
	console.log("Get Car Brands");
	const result = await filterPaginationSort(db, carBrands, options);
	console.log("Car Brands", result);
	return result;
}
