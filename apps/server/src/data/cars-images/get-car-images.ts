import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { CarImage } from "@/schemas/shared/tables/cars/car-image";
import {
	advancedQuery,
	type AdvancedQuerySchema,
} from "@/utils/filter-pagination-sort";
import type { QueryListResult } from "@/utils/resource-list-schema";

type GetCarImagesParams = AdvancedQuerySchema;

export async function getCarImages(
	db: DB,
	params: GetCarImagesParams,
): Promise<QueryListResult<CarImage>> {
	const records = await advancedQuery(db, carImages, params);

	return records;
}
