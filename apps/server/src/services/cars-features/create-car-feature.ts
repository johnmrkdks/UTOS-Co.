import { createCarFeature } from "@/data/cars-features/create-car-feature";
import type { DB } from "@/db";
import type { CarFeature, InsertCarFeature } from "@/schemas/shared";
import formatter from "lodash";

export async function createCarFeatureService(db: DB, data: InsertCarFeature): Promise<CarFeature> {
	const values = {
		...data,
		feature: formatter.startCase(data.feature),
	} as InsertCarFeature;

	const newCarFeature = createCarFeature(db, values);

	return newCarFeature;
}
