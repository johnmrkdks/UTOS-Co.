import { updateCar } from "@/data/cars/update-car";
import type { DB } from "@/db";
import type { UpdateCar } from "@/schemas/shared/tables/car";
import formatter from "lodash";

export async function updateCarService(db: DB, id: string, data: UpdateCar) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
		modelId: data.modelId ? data.modelId : undefined,
	} as UpdateCar;

	const updatedCar = await updateCar(db, id, values);

	return updatedCar;
}
