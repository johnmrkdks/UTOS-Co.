import { updateCarBrand } from "@/data/cars-brands/update-car-brand";
import type { DB } from "@/db";
import type { UpdateCarBrand } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarBrandParams = {
	id: string;
	data: UpdateCarBrand;
};

export async function updateCarBrandService(db: DB, { id, data }: UpdateCarBrandParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBrand;

	const updatedCarBrand = await updateCarBrand(db, { id, data: values });

	return updatedCarBrand;
}
