import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type { CarFeature } from "@/schemas/shared/tables/cars/car-feature";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarFeaturesParams = AdvancedQuerySchema;

export async function getCarFeatures(
	db: DB,
	params: GetCarFeaturesParams,
): Promise<QueryListResult<CarFeature>> {
	const records = await advancedQuery(db, carFeatures, params);

	return records;
}
