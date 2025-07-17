import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type { CarTransmissionType } from "@/schemas/shared/tables/cars/car-transmission-type";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarTransmissionTypesParams = AdvancedQuerySchema;

export async function getCarTransmissionTypes(
	db: DB,
	params: GetCarTransmissionTypesParams,
): Promise<QueryListResult<CarTransmissionType>> {
	const records = await advancedQuery(db, carTransmissionTypes, params);

	return records;
}
