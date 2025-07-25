import { checkCarFeatureUsage } from "@/data/cars-features/check-car-feature-usage";
import { getCarFeatureById } from "@/data/cars-features/get-car-feature-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarFeatureUsageServiceSchema = z.object({
	id: z.string(),
});

export type CheckCarFeatureUsageParams = z.infer<typeof CheckCarFeatureUsageServiceSchema>;

export async function checkCarFeatureUsageService(
	db: DB,
	{ id }: CheckCarFeatureUsageParams,
) {
	const carFeature = await getCarFeatureById(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	const usage = await checkCarFeatureUsage(db, id);

	return {
		feature: carFeature,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carFeature.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
