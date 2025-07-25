import { createCarBrand } from "@/data/cars-brands/create-car-brand";
import { getCarBrandByName } from "@/data/cars-brands/get-car-brand-by-name";
import type { DB } from "@/db";
import { InsertCarBrandSchema, type InsertCarBrand } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarBrandServiceSchema = InsertCarBrandSchema

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
