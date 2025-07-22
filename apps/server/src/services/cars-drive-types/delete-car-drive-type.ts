import { deleteCarDriveType } from "@/data/cars-drive-types/delete-car-drive-type";
import { getCarDriveType } from "@/data/cars-drive-types/get-car-drive-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteCarDriveTypeService(db: DB, id: string) {
	const carDriveType = await getCarDriveType(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	const deletedCarDriveType = await deleteCarDriveType(db, id);
	return deletedCarDriveType;
}
