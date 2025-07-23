import { getCarDriveTypes } from "@/data/cars-drive-types/get-car-drive-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarDriveTypesService(db: DB, params: ResourceList) {
	const carDriveTypes = await getCarDriveTypes(db, params);
	return carDriveTypes;
}
