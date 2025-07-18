import { getCarBrands } from "@/data/cars-brands/get-car-brands";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarBrandsService(db: DB, options: ResourceList) {
	const carBrands = await getCarBrands(db, options);
	return carBrands;
}
