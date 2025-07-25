import { checkCarBodyTypeUsage } from "@/data/cars-body-types/check-car-body-type-usage";
import { getCarBodyTypeById } from "@/data/cars-body-types/get-car-body-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarBodyTypeUsageServiceSchema = z.object({
	id: z.string(),
});

export type CheckCarBodyTypeUsageParams = z.infer<
	typeof CheckCarBodyTypeUsageServiceSchema
>;

export async function checkCarBodyTypeUsageService(
	db: DB,
	{ id }: CheckCarBodyTypeUsageParams,
) {
	const carBodyType = await getCarBodyTypeById(db, id);

	if (!carBodyType) {
		throw ErrorFactory.notFound("Car body type not found.");
	}

	const usage = await checkCarBodyTypeUsage(db, id);

	return {
		bodyType: carBodyType,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carBodyType.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
