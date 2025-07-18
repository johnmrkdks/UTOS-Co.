import { getCarModels } from "@/data/cars-models/get-car-models";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarModelsService(db: DB, options: ResourceList) {
	const carModels = await getCarModels(db, options);
	return carModels;
}
