import { checkCarTransmissionTypeUsage } from "@/data/cars-transmission-types/check-car-transmission-type-usage";
import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarTransmissionTypeUsageServiceSchema = z.object({
	id: z.string(),
});

export type CheckCarTransmissionTypeUsageParams = z.infer<typeof CheckCarTransmissionTypeUsageServiceSchema>;

export async function checkCarTransmissionTypeUsageService(
	db: DB,
	{ id }: CheckCarTransmissionTypeUsageParams,
) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	if (!carTransmissionType) {
		throw ErrorFactory.notFound("Car transmission type not found.");
	}

	const usage = await checkCarTransmissionTypeUsage(db, id);

	return {
		transmissionType: carTransmissionType,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carTransmissionType.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
