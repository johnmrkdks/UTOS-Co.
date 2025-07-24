import { createCar } from "@/data/cars/create-car";
import { getCarByName } from "@/data/cars/get-car-by-name";
import type { DB } from "@/db";
import { InsertCarSchema, type Car, type InsertCar } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarServiceSchema = InsertCarSchema

export async function createCarService(db: DB, data: z.infer<typeof CreateCarServiceSchema>) {
	const car = await getCarByName(db, data.name);

	if (car) {
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
