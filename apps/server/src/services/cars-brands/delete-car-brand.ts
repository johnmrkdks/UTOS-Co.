import { z } from "zod";
import { getCarsCountByBrandId } from "@/data/cars/get-cars-count-by-brand-id";
import { deleteCarBrand } from "@/data/cars-brands/delete-car-brand";
import { getCarBrandById } from "@/data/cars-brands/get-car-brand-by-id";
import { getCarModelsCountByBrandId } from "@/data/cars-models/get-car-models-count-by-brand-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const DeleteCarBrandServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarBrandParams = z.infer<typeof DeleteCarBrandServiceSchema>;

export async function deleteCarBrandService(
	db: DB,
	{ id }: DeleteCarBrandParams,
) {
	const [carCount, carModelsCount] = await Promise.all([
		getCarsCountByBrandId(db, id),
		getCarModelsCountByBrandId(db, id),
	]);

	if (carCount > 0 || carModelsCount > 0) {
		throw ErrorFactory.badRequest(
			"Some entities are using this car brand. Please delete them first.",
		);
	}

	const carBrand = await getCarBrandById(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound("Car brand not found.");
	}

	const deletedCarBrand = await deleteCarBrand(db, id);
	return deletedCarBrand;
}
