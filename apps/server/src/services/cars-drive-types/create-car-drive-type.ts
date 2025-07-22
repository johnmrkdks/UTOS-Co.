import { createCarDriveType } from "@/data/cars-drive-types/create-car-drive-type";
import { getCarDriveTypeByName } from "@/data/cars-drive-types/get-car-drive-type-by-name";
import type { DB } from "@/db";
import type { CarDriveType, InsertCarDriveType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarDriveTypeService(db: DB, data: InsertCarDriveType): Promise<CarDriveType> {
	const checkDriveTypeExists = await getCarDriveTypeByName(db, data.name);

	if (checkDriveTypeExists) {
		throw ErrorFactory.duplicateEntry('Car drive type', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarDriveType;

	const newCarDriveType = createCarDriveType(db, values);

	return newCarDriveType;
}
