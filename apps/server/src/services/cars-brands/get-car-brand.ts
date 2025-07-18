import { getCarBrand } from "@/data/cars-brands/get-car-brand";
import type { DB } from "@/db";

export async function getCarBrandService(db: DB, id: string) {
	const carBrand = await getCarBrand(db, id);
	return carBrand;
}
