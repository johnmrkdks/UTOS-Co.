import { deleteCarBrand } from "@/data/cars-brands/delete-car-brand";
import type { DB } from "@/db";

export async function deleteCarBrandService(db: DB, id: string) {
	const deletedCarBrand = await deleteCarBrand(db, id);
	return deletedCarBrand;
}
