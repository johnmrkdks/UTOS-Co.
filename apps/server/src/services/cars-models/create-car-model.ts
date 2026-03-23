import formatter from "lodash";
import type { z } from "zod";
import { createCarModel } from "@/data/cars-models/create-car-model";
import { getCarModelByName } from "@/data/cars-models/get-car-model-by-name";
import type { DB } from "@/db";
import { type InsertCarModel, InsertCarModelSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarModelServiceSchema = InsertCarModelSchema;

export type CreateCarModelParams = z.infer<typeof CreateCarModelServiceSchema>;

export async function createCarModelService(
	db: DB,
	data: CreateCarModelParams,
) {
	if (!data.brandId) {
		throw ErrorFactory.missingEntry("Car model", "brandId");
	}

	const carModelName = await getCarModelByName(db, data.name);

	if (carModelName) {
		throw ErrorFactory.duplicateEntry("Car model", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarModel;

	const newCarModel = createCarModel(db, values);

	return newCarModel;
}
