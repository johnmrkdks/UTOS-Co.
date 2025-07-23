import { getCarFeatures } from "@/data/cars-features/get-car-features";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarFeaturesService(db: DB, params: ResourceList) {
	const carFeatures = await getCarFeatures(db, params);
	return carFeatures;
}
