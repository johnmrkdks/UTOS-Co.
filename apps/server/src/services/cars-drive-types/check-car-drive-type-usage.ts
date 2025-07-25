import { checkCarDriveTypeUsage } from "@/data/cars-drive-types/check-car-drive-type-usage";
import { getCarDriveTypeById } from "@/data/cars-drive-types/get-car-drive-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarDriveTypeUsageServiceSchema = z.object({
	id: z.string(),
});

export async function checkCarDriveTypeUsageService(
	db: DB,
	{ id }: z.infer<typeof CheckCarDriveTypeUsageServiceSchema>,
) {
	const carDriveType = await getCarDriveTypeById(db, id);

	if (!carDriveType) {
		throw ErrorFactory.notFound("Car drive type not found.");
	}

	const usage = await checkCarDriveTypeUsage(db, id);

	return {
		driveType: carDriveType,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carDriveType.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
