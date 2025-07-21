import { getCarFeatures } from "@/data/cars-features/get-car-features";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarFeaturesService(db: DB, options: ResourceList) {
	const carFeatures = await getCarFeatures(db, options);
	return carFeatures;
}
