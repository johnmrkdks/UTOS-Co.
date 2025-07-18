import { updateCarBodyType } from "@/data/cars-body-types/update-car-body-type";
import type { DB } from "@/db";
import type { UpdateCarBodyType } from "@/schemas/shared/tables/car-body-type";
import formatter from "lodash";

export async function updateCarBodyTypeService(db: DB, id: string, data: UpdateCarBodyType) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarBodyType;

	const updatedCarBodyType = await updateCarBodyType(db, id, values);

	return updatedCarBodyType;
}
