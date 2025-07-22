import { createCarModel } from "@/data/cars-models/create-car-model";
import { getCarModelByName } from "@/data/cars-models/get-car-model-by-name";
import type { DB } from "@/db";
import type { CarModel, InsertCarModel } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarModelService(db: DB, data: InsertCarModel): Promise<CarModel> {
	const checkModelExists = await getCarModelByName(db, data.name);

	if (checkModelExists) {
		throw ErrorFactory.duplicateEntry('Car model', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarModel;

	const newCarModel = createCarModel(db, values);

	return newCarModel;
}
