import { updateCarConditionType } from "@/data/cars-condition-types/update-car-condition-type";
import type { DB } from "@/db";
import type { UpdateCarConditionType } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarConditionTypeParams = {
	id: string;
	data: UpdateCarConditionType;
};

export async function updateCarConditionTypeService(db: DB, { id, data }: UpdateCarConditionTypeParams) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarConditionType;

	const updatedCarConditionType = await updateCarConditionType(db, { id, data: values });

	return updatedCarConditionType;
}
