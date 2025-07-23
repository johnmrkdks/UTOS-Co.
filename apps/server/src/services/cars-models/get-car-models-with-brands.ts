import { getCarBrandsWithModels } from "@/data/cars-brands/get-car-brands-with-models";
import { getCarModelsWithBrand } from "@/data/cars-models/get-car-models-with-brand";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarModelsWithBrandService(db: DB, params: ResourceList) {
	const carModelsWithBrand = await getCarModelsWithBrand(db, params);
	return carModelsWithBrand;
}
