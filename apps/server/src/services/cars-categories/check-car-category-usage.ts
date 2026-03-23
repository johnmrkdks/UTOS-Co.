import { z } from "zod";
import { checkCarCategoryUsage } from "@/data/cars-categories/check-car-category-usage";
import { getCarCategoryById } from "@/data/cars-categories/get-car-catogory-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const CheckCarCategoryUsageServiceSchema = z.object({
	id: z.string(),
});

export type CheckCarCategoryUsageParams = z.infer<
	typeof CheckCarCategoryUsageServiceSchema
>;

export async function checkCarCategoryUsageService(
	db: DB,
	{ id }: CheckCarCategoryUsageParams,
) {
	const carCategory = await getCarCategoryById(db, id);

	if (!carCategory) {
		throw ErrorFactory.notFound("Car category not found.");
	}

	const usage = await checkCarCategoryUsage(db, id);

	return {
		driveType: carCategory,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carCategory.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
