import { updateCar } from "@/data/cars/update-car";
import type { DB } from "@/db";
import type { UpdateCar } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarParams = {
	id: string;
	data: UpdateCar;
};

export async function updateCarService(db: DB, { id, data }: UpdateCarParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
		modelId: data.modelId ? data.modelId : undefined,
	} as UpdateCar;

	const updatedCar = await updateCar(db, { id, data: values });

	return updatedCar;
}
