import { updateCarDriveType } from "@/data/cars-drive-types/update-car-drive-type";
import type { DB } from "@/db";
import type { UpdateCarDriveType } from "@/schemas/shared/tables/car-drive-type";
import formatter from "lodash";

export async function updateCarDriveTypeService(db: DB, id: string, data: UpdateCarDriveType) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarDriveType;

	const updatedCarDriveType = await updateCarDriveType(db, id, values);

	return updatedCarDriveType;
}
