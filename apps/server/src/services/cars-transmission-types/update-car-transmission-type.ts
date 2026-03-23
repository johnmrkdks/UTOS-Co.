import formatter from "lodash";
import { z } from "zod";
import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import { updateCarTransmissionType } from "@/data/cars-transmission-types/update-car-transmission-type";
import type { DB } from "@/db";
import {
	type UpdateCarTransmissionType,
	UpdateCarTransmissionTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarTransmissionTypeServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarTransmissionTypeSchema,
});

export type UpdateCarTransmissionTypeParams = z.infer<
	typeof UpdateCarTransmissionTypeServiceSchema
>;

export async function updateCarTransmissionTypeService(
	db: DB,
	{ id, data }: UpdateCarTransmissionTypeParams,
) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	if (!carTransmissionType) {
		throw ErrorFactory.notFound("Car transmission type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarTransmissionType;

	const updatedCarTransmissionType = await updateCarTransmissionType(db, {
		id,
		data: values,
	});

	return updatedCarTransmissionType;
}
