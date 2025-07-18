import { getCarDriveType } from "@/data/cars-drive-types/get-car-drive-type";
import type { DB } from "@/db";

export async function getCarDriveTypeService(db: DB, id: string) {
	const carDriveType = await getCarDriveType(db, id);
	return carDriveType;
}
