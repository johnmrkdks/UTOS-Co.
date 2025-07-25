import { getCarFeatureById } from "@/data/cars-features/get-car-feature-by-id";
import { updateCarFeature } from "@/data/cars-features/update-car-feature";
import type { DB } from "@/db";
import { UpdateCarFeatureSchema, type UpdateCarFeature } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const UpdateCarFeatureServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarFeatureSchema,
});

export type UpdateCarFeatureParams = z.infer<typeof UpdateCarFeatureServiceSchema>;

export async function updateCarFeatureService(
	db: DB,
	{ id, data }: UpdateCarFeatureParams,
) {
	const carFeature = await getCarFeatureById(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	const values = {
		...data,
		feature: data.feature ? formatter.startCase(data.feature) : undefined,
	} as UpdateCarFeature;

	const updatedCarFeature = await updateCarFeature(db, { id, data: values });

	return updatedCarFeature;
}
