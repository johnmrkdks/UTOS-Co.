import { getCarFeature } from "@/data/cars-features/get-car-feature";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarFeatureServiceSchema = z.object({
	id: z.string(),
});

export async function getCarFeatureService(
	db: DB,
	{ id }: z.infer<typeof GetCarFeatureServiceSchema>,
) {
	const carFeature = await getCarFeature(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	return carFeature;
}
