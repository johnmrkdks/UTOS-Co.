import { createCarDriveType } from "@/data/cars-drive-types/create-car-drive-type";
import type { DB } from "@/db";
import type { CarDriveType, InsertCarDriveType } from "@/schemas/shared/tables/car-drive-type";
import formatter from "lodash";

export async function createCarDriveTypeService(db: DB, data: InsertCarDriveType): Promise<CarDriveType> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarDriveType;

	const newCarDriveType = createCarDriveType(db, values);

	return newCarDriveType;
}
