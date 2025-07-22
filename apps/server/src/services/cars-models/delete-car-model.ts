import { deleteCarModel } from "@/data/cars-models/delete-car-model";
import { getCarModelById } from "@/data/cars-models/get-car-model-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarModelServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarModelService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarModelServiceSchema>,
) {
	const carModel = await getCarModelById(db, id);

	if (!carModel) {
		throw ErrorFactory.notFound("Car model not found.");
	}

	const deletedCarModel = await deleteCarModel(db, id);
	return deletedCarModel;
}
