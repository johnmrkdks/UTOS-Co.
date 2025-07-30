import { createCar } from "@/data/cars/create-car";
import { getCarByName } from "@/data/cars/get-car-by-name";
import { createCarImage } from "@/data/cars-images/create-car-image";
import type { DB } from "@/db";
import { InsertCarSchema, type InsertCar } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";
import { createCarsToFeature } from "@/data/cars-to-features/create-cars-to-feature";

export const CreateCarServiceSchema = InsertCarSchema

export type CreateCarParams = z.infer<typeof CreateCarServiceSchema>

export async function createCarService(db: DB, data: CreateCarParams) {
	const car = await getCarByName(db, data.name);

	if (car) {
		throw ErrorFactory.duplicateEntry('Car', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
		modelId: data.modelId,
	} as InsertCar;

	const newCar = await createCar(db, values);

	console.log("NEW CAR", newCar);

	console.log("DATA IMAGE", data.images);
	console.log("DATA FEATURES", data.features);

	if (data.features) {
		for (const feature of data.features) {
			await createCarsToFeature(db, {
				carId: newCar.id,
				featureId: feature,
			});
		}
	}

	if (data.images) {
		for (const image of data.images) {
			await createCarImage(db, {
				carId: newCar.id,
				url: image.url,
				order: image.order,
				isMain: image.isMain,
			});
		}
	}

	return newCar;
}
