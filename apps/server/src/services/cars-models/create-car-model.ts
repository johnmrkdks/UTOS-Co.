import { createCarModel } from "@/data/cars-models/create-car-model";
import type { DB } from "@/db";
import type { CarModel, InsertCarModel } from "@/schemas/shared/tables/car-model";
import formatter from "lodash";

export async function createCarModelService(db: DB, data: InsertCarModel): Promise<CarModel> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarModel;

	const newCarModel = createCarModel(db, values);

	return newCarModel;
}
