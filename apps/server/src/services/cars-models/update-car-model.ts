import { updateCarModel } from "@/data/cars-models/update-car-model";
import type { DB } from "@/db";
import type { UpdateCarModel } from "@/schemas/shared/tables/car-model";
import formatter from "lodash";

export async function updateCarModelService(db: DB, id: string, data: UpdateCarModel) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarModel;

	const updatedCarModel = await updateCarModel(db, id, values);

	return updatedCarModel;
}
