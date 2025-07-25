import { getCarConditionTypeById } from "@/data/cars-condition-types/get-car-condition-type-by-id";
import { updateCarConditionType } from "@/data/cars-condition-types/update-car-condition-type";
import type { DB } from "@/db";
import { UpdateCarConditionTypeSchema, type UpdateCarConditionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const UpdateCarConditionTypeServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarConditionTypeSchema,
});

export type UpdateCarConditionTypeParams = z.infer<typeof UpdateCarConditionTypeServiceSchema>;

export async function updateCarConditionTypeService(
	db: DB,
	{ id, data }: UpdateCarConditionTypeParams,
) {
	const carConditionType = await getCarConditionTypeById(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarConditionType;

	const updatedCarConditionType = await updateCarConditionType(db, { id, data: values });

	return updatedCarConditionType;
}
