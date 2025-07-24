import { deleteCarFeature } from "@/data/cars-features/delete-car-feature";
import { getCarFeatureById } from "@/data/cars-features/get-car-feature-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarFeatureServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarFeatureService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarFeatureServiceSchema>,
) {
	const carFeature = await getCarFeatureById(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	const deletedCarFeature = await deleteCarFeature(db, id);
	return deletedCarFeature;
}
