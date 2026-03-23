import formatter from "lodash";
import { z } from "zod";
import { getCarDriveTypeById } from "@/data/cars-drive-types/get-car-drive-type-by-id";
import { updateCarDriveType } from "@/data/cars-drive-types/update-car-drive-type";
import type { DB } from "@/db";
import {
	type UpdateCarDriveType,
	UpdateCarDriveTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarDriveTypeServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarDriveTypeSchema,
});

export type UpdateCarDriveTypeParams = z.infer<
	typeof UpdateCarDriveTypeServiceSchema
>;

export async function updateCarDriveTypeService(
	db: DB,
	{ id, data }: UpdateCarDriveTypeParams,
) {
	const carDriveType = await getCarDriveTypeById(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarDriveType;

	const updatedCarDriveType = await updateCarDriveType(db, {
		id,
		data: values,
	});

	return updatedCarDriveType;
}
