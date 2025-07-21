import { updateCarModel } from "@/data/cars-models/update-car-model";
import type { DB } from "@/db";
import type { UpdateCarModel } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarModelParams = {
	id: string;
	data: UpdateCarModel;
};

export async function updateCarModelService(db: DB, { id, data }: UpdateCarModelParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarModel;

	const updatedCarModel = await updateCarModel(db, { id, data: values });

	return updatedCarModel;
}
