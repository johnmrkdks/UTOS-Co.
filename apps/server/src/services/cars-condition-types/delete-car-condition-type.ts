import { deleteCarConditionType } from "@/data/cars-condition-types/delete-car-condition-type";
import { getCarConditionTypeById } from "@/data/cars-condition-types/get-car-condition-type-by-id";
import { getCarsCountByConditionTypeId } from "@/data/cars/get-cars-count-by-condition-type-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarConditionTypeServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarConditionTypeParams = z.infer<typeof DeleteCarConditionTypeServiceSchema>;

export async function deleteCarConditionTypeService(
	db: DB,
	{ id }: DeleteCarConditionTypeParams,
) {
	const carCount = await getCarsCountByConditionTypeId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest("Some entities are using this car condition type. Please delete them first.");
	}

	const carConditionType = await getCarConditionTypeById(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	const deletedCarConditionType = await deleteCarConditionType(db, id);
	return deletedCarConditionType;
}
