import { updateCarBrand } from "@/data/cars-brands/update-car-brand";
import type { DB } from "@/db";
import type { UpdateCarBrand } from "@/schemas/shared/tables/car-brand";
import formatter from "lodash";

export async function updateCarBrandService(db: DB, id: string, data: UpdateCarBrand) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBrand;

	const updatedCarBrand = await updateCarBrand(db, id, values);

	return updatedCarBrand;
}
