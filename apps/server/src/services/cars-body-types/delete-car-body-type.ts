import { deleteCarBodyType } from "@/data/cars-body-types/delete-car-body-type";
import { getCarBodyTypeById } from "@/data/cars-body-types/get-car-body-type-by-id";
import { getCarsCountByBodyTypeId } from "@/data/cars/get-cars-count-by-body-type-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarBodyTypeServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarBodyTypeParams = z.infer<
	typeof DeleteCarBodyTypeServiceSchema
>;

export async function deleteCarBodyTypeService(
	db: DB,
	{ id }: DeleteCarBodyTypeParams,
) {
	const carCount = await getCarsCountByBodyTypeId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest("Some entities are using this car body type. Please delete them first.");
	}

	const carBodyType = await getCarBodyTypeById(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	const deletedCarBodyType = await deleteCarBodyType(db, id);
	return deletedCarBodyType;
}
