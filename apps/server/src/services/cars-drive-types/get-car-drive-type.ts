import { getCarDriveTypeById } from "@/data/cars-drive-types/get-car-drive-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarDriveTypeServiceSchema = z.object({
	id: z.string(),
});

export type GetCarDriveTypeByIdParams = z.infer<typeof GetCarDriveTypeServiceSchema>;

export async function getCarDriveTypeService(
	db: DB,
	{ id }: GetCarDriveTypeByIdParams,
) {
	const carDriveType = await getCarDriveTypeById(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	return carDriveType;
}
