import formatter from "lodash";
import { z } from "zod";
import { getCarModelById } from "@/data/cars-models/get-car-model-by-id";
import { updateCarModel } from "@/data/cars-models/update-car-model";
import type { DB } from "@/db";
import { type UpdateCarModel, UpdateCarModelSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarModelServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarModelSchema,
});

export type UpdateCarModelParams = z.infer<typeof UpdateCarModelServiceSchema>;

export async function updateCarModelService(
	db: DB,
	{ id, data }: UpdateCarModelParams,
) {
	const carModel = await getCarModelById(db, id);

	if (!carModel) {
		throw ErrorFactory.notFound("Car model not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarModel;

	const updatedCarModel = await updateCarModel(db, { id, data: values });

	return updatedCarModel;
}
