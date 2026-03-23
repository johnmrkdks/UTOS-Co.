import formatter from "lodash";
import type { z } from "zod";
import { createCarDriveType } from "@/data/cars-drive-types/create-car-drive-type";
import { getCarDriveTypeByName } from "@/data/cars-drive-types/get-car-drive-type-by-name";
import type { DB } from "@/db";
import {
	type InsertCarDriveType,
	InsertCarDriveTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarDriveTypeServiceSchema = InsertCarDriveTypeSchema;

export type CreateCarDriveTypeParams = z.infer<
	typeof CreateCarDriveTypeServiceSchema
>;

export async function createCarDriveTypeService(
	db: DB,
	data: CreateCarDriveTypeParams,
) {
	const carDriveTypeName = await getCarDriveTypeByName(db, data.name);

	if (carDriveTypeName) {
		throw ErrorFactory.duplicateEntry("Car drive type", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarDriveType;

	const newCarDriveType = createCarDriveType(db, values);

	return newCarDriveType;
}
