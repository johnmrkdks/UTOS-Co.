import { getCarDriveType } from "@/data/cars-drive-types/get-car-drive-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getCarDriveTypeService(db: DB, id: string) {
	const carDriveType = await getCarDriveType(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	return carDriveType;
}
