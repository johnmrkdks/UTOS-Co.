import { getCarBrandsWithModels } from "@/data/cars-brands/get-car-brands-with-models";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarBrandsWithModelsService(
	db: DB,
	params: ResourceList,
) {
	const carBrandsWithModels = await getCarBrandsWithModels(db, params);
	return carBrandsWithModels;
}
