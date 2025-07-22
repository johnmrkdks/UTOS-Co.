import { deleteCarBrand } from "@/data/cars-brands/delete-car-brand";
import { getCarBrand } from "@/data/cars-brands/get-car-brand";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

type DeleteCarBrandServiceInput = {
	id: string
}

export async function deleteCarBrandService(db: DB, { id }: DeleteCarBrandServiceInput) {
	const carBrand = await getCarBrand(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound("Car brand not found.");
	}

	const deletedCarBrand = await deleteCarBrand(db, id);
	return deletedCarBrand;
}
