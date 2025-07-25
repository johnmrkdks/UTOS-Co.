import { checkCarConditionTypeUsage } from "@/data/cars-condition-types/check-car-condition-type-usage";
import { getCarConditionTypeById } from "@/data/cars-condition-types/get-car-condition-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const CheckCarConditionTypeUsageServiceSchema = z.object({
	id: z.string(),
});

export type CheckCarConditionTypeUsageParams = z.infer<typeof CheckCarConditionTypeUsageServiceSchema>;

export async function checkCarConditionTypeUsageService(
	db: DB,
	{ id }: CheckCarConditionTypeUsageParams,
) {
	const carConditionType = await getCarConditionTypeById(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	const usage = await checkCarConditionTypeUsage(db, id);

	return {
		conditionType: carConditionType,
		usage,
		canDelete: !usage.isInUse,
		errorMessage: usage.isInUse
			? `Cannot delete "${carConditionType.name}". It is currently used by ${usage.carCount} cars.`
			: null,
	};
}
