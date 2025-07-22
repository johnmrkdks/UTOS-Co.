import { deleteCarDriveType } from "@/data/cars-drive-types/delete-car-drive-type";
import { getCarDriveType } from "@/data/cars-drive-types/get-car-drive-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarDriveTypeServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarDriveTypeService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarDriveTypeServiceSchema>,
) {
	const carDriveType = await getCarDriveType(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	const deletedCarDriveType = await deleteCarDriveType(db, id);
	return deletedCarDriveType;
}
