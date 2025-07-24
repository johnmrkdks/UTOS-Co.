import { createCarDriveType } from "@/data/cars-drive-types/create-car-drive-type";
import { getCarDriveTypeByName } from "@/data/cars-drive-types/get-car-drive-type-by-name";
import type { DB } from "@/db";
import { InsertCarDriveTypeSchema, type InsertCarDriveType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarDriveTypeServiceSchema = InsertCarDriveTypeSchema;

export async function createCarDriveTypeService(
	db: DB,
	data: z.infer<typeof CreateCarDriveTypeServiceSchema>,
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
