import { getCarDriveType } from "@/data/cars-drive-types/get-car-drive-type";
import { updateCarDriveType } from "@/data/cars-drive-types/update-car-drive-type";
import type { DB } from "@/db";
import type { UpdateCarDriveType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

type UpdateCarDriveTypeParams = {
	id: string;
	data: UpdateCarDriveType;
};

export async function updateCarDriveTypeService(db: DB, { id, data }: UpdateCarDriveTypeParams) {
	const carDriveType = await getCarDriveType(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarDriveType;

	const updatedCarDriveType = await updateCarDriveType(db, { id, data: values });

	return updatedCarDriveType;
}
