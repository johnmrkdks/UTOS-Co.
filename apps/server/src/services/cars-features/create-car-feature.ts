import { createCarFeature } from "@/data/cars-features/create-car-feature";
import type { DB } from "@/db";
import type { CarFeature, InsertCarFeature } from "@/schemas/shared/tables/car-feature";
import formatter from "lodash";

export async function createCarFeatureService(db: DB, data: InsertCarFeature): Promise<CarFeature> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarFeature;

	const newCarFeature = createCarFeature(db, values);

	return newCarFeature;
}
