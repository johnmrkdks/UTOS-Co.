import { createCarBrand } from "@/data/cars-brands/create-car-brand";
import { getCarBrandByName } from "@/data/cars-brands/get-car-brand-by-name";
import type { DB } from "@/db";
import { InsertCarBrandSchema, type InsertCarBrand } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarBrandServiceSchema = z.object({
	data: InsertCarBrandSchema,
});

export async function createCarBrandService(
	db: DB,
	{ data }: z.infer<typeof CreateCarBrandServiceSchema>,
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
