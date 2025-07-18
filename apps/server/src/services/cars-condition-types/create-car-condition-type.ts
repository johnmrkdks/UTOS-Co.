import { createCarConditionType } from "@/data/cars-condition-types/create-car-condition-type";
import type { DB } from "@/db";
import type { CarConditionType, InsertCarConditionType } from "@/schemas/shared/tables/car-condition-type";
import formatter from "lodash";

export async function createCarConditionTypeService(db: DB, data: InsertCarConditionType): Promise<CarConditionType> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarConditionType;

	const newCarConditionType = createCarConditionType(db, values);

	return newCarConditionType;
}
