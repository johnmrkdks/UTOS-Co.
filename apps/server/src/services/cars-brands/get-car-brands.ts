import { getCarBrands } from "@/data/cars-brands/get-car-brands";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarBrandsService(db: DB, params: ResourceList) {
	const carBrands = await getCarBrands(db, params);
	return carBrands;
}
