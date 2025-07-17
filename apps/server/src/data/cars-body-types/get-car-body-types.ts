import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type { CarBodyType } from "@/schemas/shared/tables/cars/car-body-type";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarBodyTypesParams = AdvancedQuerySchema;

export async function getCarBodyTypes(
	db: DB,
	params: GetCarBodyTypesParams,
): Promise<QueryListResult<CarBodyType>> {
	const records = await advancedQuery(db, carBodyTypes, params);

	return records;
}
