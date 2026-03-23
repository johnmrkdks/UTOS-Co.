import { z } from "zod";
import { getCarConditionTypeById } from "@/data/cars-condition-types/get-car-condition-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarConditionTypeServiceSchema = z.object({
	id: z.string(),
});

export type GetCarConditionTypeByIdParams = z.infer<
	typeof GetCarConditionTypeServiceSchema
>;

export async function getCarConditionTypeService(
	db: DB,
	{ id }: GetCarConditionTypeByIdParams,
) {
	const carConditionType = await getCarConditionTypeById(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	return carConditionType;
}
