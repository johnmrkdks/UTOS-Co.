import { getCarDriveType } from "@/data/cars-drive-types/get-car-drive-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarDriveTypeServiceSchema = z.object({
	id: z.string(),
});

export async function getCarDriveTypeService(
	db: DB,
	{ id }: z.infer<typeof GetCarDriveTypeServiceSchema>,
) {
	const carDriveType = await getCarDriveType(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	return carDriveType;
}
