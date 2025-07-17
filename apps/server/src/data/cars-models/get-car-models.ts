import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type { CarModel } from "@/schemas/shared/tables/cars/car-model";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarModelsParams = AdvancedQuerySchema;

export async function getCarModels(
	db: DB,
	params: GetCarModelsParams,
): Promise<QueryListResult<CarModel>> {
	const records = await advancedQuery(db, carModels, params);

	return records;
}
