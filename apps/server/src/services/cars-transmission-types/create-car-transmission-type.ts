import formatter from "lodash";
import type { z } from "zod";
import { createCarTransmissionType } from "@/data/cars-transmission-types/create-car-transmission-type";
import { getCarTransmissionTypeByName } from "@/data/cars-transmission-types/get-car-transmission-type-by-name";
import type { DB } from "@/db";
import {
	type InsertCarTransmissionType,
	InsertCarTransmissionTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarTransmissionTypeServiceSchema =
	InsertCarTransmissionTypeSchema;

export type CreateCarTransmissionTypeParams = z.infer<
	typeof CreateCarTransmissionTypeServiceSchema
>;

export async function createCarTransmissionTypeService(
	db: DB,
	data: CreateCarTransmissionTypeParams,
) {
	const carTransmissionTypeName = await getCarTransmissionTypeByName(
		db,
		data.name,
	);

	if (carTransmissionTypeName) {
		throw ErrorFactory.duplicateEntry("Car transmission type", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarTransmissionType;

	const newCarTransmissionType = createCarTransmissionType(db, values);

	return newCarTransmissionType;
}
