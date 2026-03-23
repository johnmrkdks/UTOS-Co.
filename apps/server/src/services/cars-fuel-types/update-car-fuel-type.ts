import formatter from "lodash";
import { z } from "zod";
import { getCarFuelTypeById } from "@/data/cars-fuel-types/get-car-fuel-type-by-id";
import { updateCarFuelType } from "@/data/cars-fuel-types/update-car-fuel-type";
import type { DB } from "@/db";
import {
	type UpdateCarFuelType,
	UpdateCarFuelTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarFuelTypeServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarFuelTypeSchema,
});

export type UpdateCarFuelTypeParams = z.infer<
	typeof UpdateCarFuelTypeServiceSchema
>;

export async function updateCarFuelTypeService(
	db: DB,
	{ id, data }: UpdateCarFuelTypeParams,
) {
	const carFuelType = await getCarFuelTypeById(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarFuelType;

	const updatedCarFuelType = await updateCarFuelType(db, { id, data: values });

	return updatedCarFuelType;
}
