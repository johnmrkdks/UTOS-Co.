import { deleteCarConditionType } from "@/data/cars-condition-types/delete-car-condition-type";
import { getCarConditionType } from "@/data/cars-condition-types/get-car-condition-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarConditionTypeServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarConditionTypeService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarConditionTypeServiceSchema>,
) {
	const carConditionType = await getCarConditionType(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	const deletedCarConditionType = await deleteCarConditionType(db, id);
	return deletedCarConditionType;
}
