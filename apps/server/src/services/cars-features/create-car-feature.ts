import { createCarFeature } from "@/data/cars-features/create-car-feature";
import { getCarFeatureByName } from "@/data/cars-features/get-car-feature-by-name";
import type { DB } from "@/db";
import { InsertCarFeatureSchema, type InsertCarFeature } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarFeatureServiceSchema = InsertCarFeatureSchema;

export type CreateCarFeatureParams = z.infer<typeof CreateCarFeatureServiceSchema>;

export async function createCarFeatureService(
	db: DB,
	data: CreateCarFeatureParams,
) {
	const carFeature = await getCarFeatureByName(db, data.name);

	if (carFeature) {
		throw ErrorFactory.duplicateEntry("Car feature", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarFeature;

	const newCarFeature = createCarFeature(db, values);

	return newCarFeature;
}
