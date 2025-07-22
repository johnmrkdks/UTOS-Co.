import { deleteCarBodyType } from "@/data/cars-body-types/delete-car-body-type";
import { getCarBodyType } from "@/data/cars-body-types/get-car-body-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarBodyTypeServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarBodyTypeService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarBodyTypeServiceSchema>,
) {
	const carBodyType = await getCarBodyType(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	const deletedCarBodyType = await deleteCarBodyType(db, id);
	return deletedCarBodyType;
}
