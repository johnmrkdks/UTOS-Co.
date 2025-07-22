import { getCarConditionType } from "@/data/cars-condition-types/get-car-condition-type";
import { updateCarConditionType } from "@/data/cars-condition-types/update-car-condition-type";
import type { DB } from "@/db";
import type { UpdateCarConditionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

type UpdateCarConditionTypeParams = {
	id: string;
	data: UpdateCarConditionType;
};

export async function updateCarConditionTypeService(db: DB, { id, data }: UpdateCarConditionTypeParams) {
	const carConditionType = await getCarConditionType(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarConditionType;

	const updatedCarConditionType = await updateCarConditionType(db, { id, data: values });

	return updatedCarConditionType;
}
