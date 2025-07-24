import { createCarConditionType } from "@/data/cars-condition-types/create-car-condition-type";
import { getCarConditionTypeByName } from "@/data/cars-condition-types/get-car-condition-type-by-name";
import type { DB } from "@/db";
import { InsertCarConditionTypeSchema, type InsertCarConditionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarConditionTypeServiceSchema = InsertCarConditionTypeSchema

export async function createCarConditionTypeService(
	db: DB,
	data: z.infer<typeof CreateCarConditionTypeServiceSchema>,
) {
	const carConditionTypeName = await getCarConditionTypeByName(db, data.name);

	if (carConditionTypeName) {
		throw ErrorFactory.duplicateEntry("Car condition type", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarConditionType;

	const newCarConditionType = createCarConditionType(db, values);

	return newCarConditionType;
}
