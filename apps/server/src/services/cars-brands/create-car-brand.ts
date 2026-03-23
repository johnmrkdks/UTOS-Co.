import formatter from "lodash";
import type { z } from "zod";
import { createCarBrand } from "@/data/cars-brands/create-car-brand";
import { getCarBrandByName } from "@/data/cars-brands/get-car-brand-by-name";
import type { DB } from "@/db";
import { type InsertCarBrand, InsertCarBrandSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarBrandServiceSchema = InsertCarBrandSchema;

export type CreateCarBrandParams = z.infer<typeof CreateCarBrandServiceSchema>;

export async function createCarBrandService(
	db: DB,
	data: CreateCarBrandParams,
) {
	const carBrandName = await getCarBrandByName(db, data.name);

	if (carBrandName) {
		throw ErrorFactory.duplicateEntry("Car brand", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarBrand;

	const newCarBrand = createCarBrand(db, values);

	return newCarBrand;
}
