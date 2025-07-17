import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import type { CarFuelType } from "@/schemas/shared/tables/cars/car-fuel-type";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarFuelTypesParams = AdvancedQuerySchema;

export async function getCarFuelTypes(
	db: DB,
	params: GetCarFuelTypesParams,
): Promise<QueryListResult<CarFuelType>> {
	const records = await advancedQuery(db, carFuelTypes, params);

	return records;
}
