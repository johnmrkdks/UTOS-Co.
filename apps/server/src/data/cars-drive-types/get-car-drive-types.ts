import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import type { CarDriveType } from "@/schemas/shared/tables/cars/car-drive-type";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarDriveTypeParams = AdvancedQuerySchema;

export async function getCarDriveTypes(
	db: DB,
	params: GetCarDriveTypeParams,
): Promise<QueryListResult<CarDriveType>> {
	const records = await advancedQuery(db, carDriveTypes, params);

	return records;
}
