import { getCarBodyTypeById } from "@/data/cars-body-types/get-car-body-type-by-id";
import { updateCarBodyType } from "@/data/cars-body-types/update-car-body-type";
import type { DB } from "@/db";
import { UpdateCarBodyTypeSchema, type UpdateCarBodyType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const UpdateCarBodyTypeServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarBodyTypeSchema,
});

export async function updateCarBodyTypeService(
	db: DB,
	{ id, data }: z.infer<typeof UpdateCarBodyTypeServiceSchema>,
) {
	const carBodyType = await getCarBodyTypeById(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBodyType;

	const updatedCarBodyType = await updateCarBodyType(db, { id, data: values });

	return updatedCarBodyType;
}
