import { createCarConditionType } from "@/data/cars-condition-types/create-car-condition-type";
import { getCarConditionTypeByName } from "@/data/cars-condition-types/get-car-condition-type-by-name";
import type { DB } from "@/db";
import type { CarConditionType, InsertCarConditionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarConditionTypeService(db: DB, data: InsertCarConditionType): Promise<CarConditionType> {
	const checkConditionTypeExists = await getCarConditionTypeByName(db, data.name);

	if (checkConditionTypeExists) {
		throw ErrorFactory.duplicateEntry('Car condition type', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarConditionType;

	const newCarConditionType = createCarConditionType(db, values);

	return newCarConditionType;
}
