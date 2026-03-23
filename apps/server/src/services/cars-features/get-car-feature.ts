import { z } from "zod";
import { getCarFeatureById } from "@/data/cars-features/get-car-feature-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarFeatureServiceSchema = z.object({
	id: z.string(),
});

export type GetCarFeatureByIdParams = z.infer<
	typeof GetCarFeatureServiceSchema
>;

export async function getCarFeatureService(
	db: DB,
	{ id }: GetCarFeatureByIdParams,
) {
	const carFeature = await getCarFeatureById(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	return carFeature;
}
