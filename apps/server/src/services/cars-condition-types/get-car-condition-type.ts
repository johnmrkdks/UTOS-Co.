import { getCarConditionType } from "@/data/cars-condition-types/get-car-condition-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarConditionTypeServiceSchema = z.object({
	id: z.string(),
});

export async function getCarConditionTypeService(
	db: DB,
	{ id }: z.infer<typeof GetCarConditionTypeServiceSchema>,
) {
	const carConditionType = await getCarConditionType(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	return carConditionType;
}
