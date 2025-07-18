import { getCarDriveTypes } from "@/data/cars-drive-types/get-car-drive-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarDriveTypesService(db: DB, options: ResourceList) {
	const carDriveTypes = await getCarDriveTypes(db, options);
	return carDriveTypes;
}
