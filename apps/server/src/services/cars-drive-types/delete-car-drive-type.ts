import { deleteCarDriveType } from "@/data/cars-drive-types/delete-car-drive-type";
import { getCarDriveTypeById } from "@/data/cars-drive-types/get-car-drive-type-by-id";
import { getCarsCountByDriveTypeId } from "@/data/cars/get-cars-count-by-drive-type-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarDriveTypeServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarDriveTypeParams = z.infer<typeof DeleteCarDriveTypeServiceSchema>;

export async function deleteCarDriveTypeService(
	db: DB,
	{ id }: DeleteCarDriveTypeParams,
) {
	const carCount = await getCarsCountByDriveTypeId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest("Some entities are using this car drive type. Please delete them first.");
	}

	const carDriveType = await getCarDriveTypeById(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	const deletedCarDriveType = await deleteCarDriveType(db, id);
	return deletedCarDriveType;
}
