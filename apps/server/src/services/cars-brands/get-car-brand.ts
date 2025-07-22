import { getCarBrand } from "@/data/cars-brands/get-car-brand";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

type GetCarBrandServiceInput = {
	id: string
}

export async function getCarBrandService(db: DB, { id }: GetCarBrandServiceInput) {
	const carBrand = await getCarBrand(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound('Car brand');
	}

	return carBrand;
}
