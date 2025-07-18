import { updateCarConditionType } from "@/data/cars-condition-types/update-car-condition-type";
import type { DB } from "@/db";
import type { UpdateCarConditionType } from "@/schemas/shared/tables/car-condition-type";
import formatter from "lodash";

export async function updateCarConditionTypeService(db: DB, id: string, data: UpdateCarConditionType) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarConditionType;

	const updatedCarConditionType = await updateCarConditionType(db, id, values);

	return updatedCarConditionType;
}
