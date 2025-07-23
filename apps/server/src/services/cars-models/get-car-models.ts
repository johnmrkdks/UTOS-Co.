import { getCarModels } from "@/data/cars-models/get-car-models";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarModelsService(db: DB, params: ResourceList) {
	const carModels = await getCarModels(db, params);
	return carModels;
}
