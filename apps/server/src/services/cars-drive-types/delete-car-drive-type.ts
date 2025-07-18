import { deleteCarDriveType } from "@/data/cars-drive-types/delete-car-drive-type";
import type { DB } from "@/db";

export async function deleteCarDriveTypeService(db: DB, id: string) {
	const deletedCarDriveType = await deleteCarDriveType(db, id);
	return deletedCarDriveType;
}
