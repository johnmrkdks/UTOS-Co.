import { checkCarBrandUsage } from "@/data/cars-brands/check-car-brand-usage";
import { getCarBrandById } from "@/data/cars-brands/get-car-brand-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarBrandUsageServiceSchema = z.object({
	id: z.string(),
});

export async function checkCarBrandUsageService(
	db: DB,
	{ id }: z.infer<typeof CheckCarBrandUsageServiceSchema>,
) {
	const carBrand = await getCarBrandById(db, id);

	if (!carBrand) {
		throw ErrorFactory.notFound("Car brand not found.");
	}

	const usage = await checkCarBrandUsage(db, id);

	return {
		brand: carBrand,
		usage,
		canDelete: !usage.isInUse,
		// Formatted message for frontend
		errorMessage: usage.isInUse
			? `Cannot delete "${carBrand.name}". It is currently used by ${usage.carCount} cars and ${usage.carModelsCount} car models.`
			: null,
	};
}
