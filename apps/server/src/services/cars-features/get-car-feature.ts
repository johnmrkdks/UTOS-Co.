import { getCarFeature } from "@/data/cars-features/get-car-feature";
import type { DB } from "@/db";

export async function getCarFeatureService(db: DB, id: string) {
	const carFeature = await getCarFeature(db, id);
	return carFeature;
}
