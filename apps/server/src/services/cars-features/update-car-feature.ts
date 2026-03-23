import formatter from "lodash";
import { z } from "zod";
import { getCarFeatureById } from "@/data/cars-features/get-car-feature-by-id";
import { updateCarFeature } from "@/data/cars-features/update-car-feature";
import type { DB } from "@/db";
import {
	type UpdateCarFeature,
	UpdateCarFeatureSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarFeatureServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarFeatureSchema,
});

export type UpdateCarFeatureParams = z.infer<
	typeof UpdateCarFeatureServiceSchema
>;

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
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarFeature;

	const updatedCarFeature = await updateCarFeature(db, { id, data: values });

	return updatedCarFeature;
}
