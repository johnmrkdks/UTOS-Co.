import { createCar } from "@/data/cars/create-car";
import { getCarByName } from "@/data/cars/get-car-by-name";
import type { DB } from "@/db";
import type { Car, InsertCar } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarService(db: DB, data: InsertCar): Promise<Car> {
	const checkCarExists = await getCarByName(db, data.name);

	if (checkCarExists) {
		throw ErrorFactory.duplicateEntry('Car', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
		modelId: data.modelId,
	} as InsertCar;

	const newCar = createCar(db, values);

	return newCar;
}
