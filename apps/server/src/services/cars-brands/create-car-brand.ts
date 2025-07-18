import { createCarBrand } from "@/data/cars-brands/create-car-brand";
import type { DB } from "@/db";
import type { CarBrand, InsertCarBrand } from "@/schemas/shared/tables/car-brand";
import formatter from "lodash";

export async function createCarBrandService(db: DB, data: InsertCarBrand): Promise<CarBrand> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarBrand;

	const newCarBrand = createCarBrand(db, values);

	return newCarBrand;
}
