import { checkCarFuelTypeUsage } from "@/data/cars-fuel-types/check-car-fuel-type-usage";
import { getCarFuelTypeById } from "@/data/cars-fuel-types/get-car-fuel-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarFuelTypeUsageServiceSchema = z.object({
	id: z.string(),
});

export type CheckCarFuelTypeUsageParams = z.infer<typeof CheckCarFuelTypeUsageServiceSchema>;

export async function checkCarFuelTypeUsageService(
	db: DB,
	{ id }: CheckCarFuelTypeUsageParams,
) {
	const carFuelType = await getCarFuelTypeById(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	const usage = await checkCarFuelTypeUsage(db, id);

	return {
		fuelType: carFuelType,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carFuelType.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
