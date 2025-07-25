import { checkCarModelUsage } from "@/data/cars-models/check-car-model-usage";
import { getCarModelById } from "@/data/cars-models/get-car-model-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarModelUsageServiceSchema = z.object({
	id: z.string(),
});

export async function checkCarModelUsageService(
	db: DB,
	{ id }: z.infer<typeof CheckCarModelUsageServiceSchema>,
) {
	const carModel = await getCarModelById(db, id);

	if (!carModel) {
		throw ErrorFactory.notFound("Car model not found.");
	}

	const usage = await checkCarModelUsage(db, id);

	return {
		model: carModel,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carModel.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
