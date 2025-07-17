import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car } from "@/schemas/shared/tables/car";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarsParams = AdvancedQuerySchema;

export async function getCars(
	db: DB,
	params: GetCarsParams,
): Promise<QueryListResult<Car>> {
	const records = await advancedQuery(db, cars, params);

	return records;
}
