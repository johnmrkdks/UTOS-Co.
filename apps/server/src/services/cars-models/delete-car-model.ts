import { z } from "zod";
import { getCarsCountByModelId } from "@/data/cars/get-cars-count-by-model-id";
import { deleteCarModel } from "@/data/cars-models/delete-car-model";
import { getCarModelById } from "@/data/cars-models/get-car-model-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const DeleteCarModelServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarModelParams = z.infer<typeof DeleteCarModelServiceSchema>;

export async function deleteCarModelService(
	db: DB,
	{ id }: DeleteCarModelParams,
) {
	const carCount = await getCarsCountByModelId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest(
			"Some entities are using this car model. Please delete them first.",
		);
	}

	const carModel = await getCarModelById(db, id);

	if (!carModel) {
		throw ErrorFactory.notFound("Car model not found.");
	}

	const deletedCarModel = await deleteCarModel(db, id);
	return deletedCarModel;
}
