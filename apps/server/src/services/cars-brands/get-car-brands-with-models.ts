import { getCarBrandsWithModels } from "@/data/cars-brands/get-car-brands-with-models";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrandsWithModelsService(db: DB, options: ResourceList) {
	const carBrandsWithModels = await getCarBrandsWithModels(db, options);
	return carBrandsWithModels;
}
