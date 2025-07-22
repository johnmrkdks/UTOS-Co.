import { createCarFeature } from "@/data/cars-features/create-car-feature";
import { getCarFeatureByFeature } from "@/data/cars-features/get-car-feature-by-feature";
import type { DB } from "@/db";
import type { CarFeature, InsertCarFeature } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarFeatureService(db: DB, data: InsertCarFeature): Promise<CarFeature> {
	const carFeature = await getCarFeatureByFeature(db, data.feature);

	if (carFeature) {
		throw ErrorFactory.duplicateEntry('Car feature', "feature");
	}

	const values = {
		...data,
		feature: formatter.startCase(data.feature),
	} as InsertCarFeature;

	const newCarFeature = createCarFeature(db, values);

	return newCarFeature;
}
