import { deleteCarBrand } from "@/data/cars-brands/delete-car-brand";
import type { DB } from "@/db";

type DeleteCarBrandServiceInput = {
	id: string
}

export async function deleteCarBrandService(db: DB, { id }: DeleteCarBrandServiceInput) {
	const deletedCarBrand = await deleteCarBrand(db, id);
	return deletedCarBrand;
}
