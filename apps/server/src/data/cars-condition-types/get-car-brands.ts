import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type { CarBrand } from "@/schemas/shared/tables/cars/car-brand";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarBrandsParams = AdvancedQuerySchema;

export async function getCarBrands(
	db: DB,
	params: GetCarBrandsParams,
): Promise<QueryListResult<CarBrand>> {
	const records = await advancedQuery(db, carBrands, params);

	return records;
}
