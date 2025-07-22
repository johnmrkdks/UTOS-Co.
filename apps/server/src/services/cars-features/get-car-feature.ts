import { getCarFeature } from "@/data/cars-features/get-car-feature";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getCarFeatureService(db: DB, id: string) {
	const carFeature = await getCarFeature(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	return carFeature;
}
