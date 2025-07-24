import { createCarModel } from "@/data/cars-models/create-car-model";
import { getCarModelByName } from "@/data/cars-models/get-car-model-by-name";
import type { DB } from "@/db";
import { InsertCarModelSchema, type InsertCarModel } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarModelServiceSchema = InsertCarModelSchema;

export async function createCarModelService(
	db: DB,
	data: z.infer<typeof CreateCarModelServiceSchema>,
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
