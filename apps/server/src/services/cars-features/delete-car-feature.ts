import { deleteCarFeature } from "@/data/cars-features/delete-car-feature";
import type { DB } from "@/db";

export async function deleteCarFeatureService(db: DB, id: string) {
	const deletedCarFeature = await deleteCarFeature(db, id);
	return deletedCarFeature;
}
