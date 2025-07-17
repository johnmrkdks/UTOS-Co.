import { createCar } from "@/data/cars/create-car";
import type { DB } from "@/db";
import type { Car, InsertCar } from "@/schemas/shared/tables/car";
import formatter from "lodash";

export async function createCarService(db: DB, data: InsertCar): Promise<Car> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
		model: formatter.startCase(data.model),
	} as InsertCar;

	const newCar = createCar(db, values);

	return newCar;
}
