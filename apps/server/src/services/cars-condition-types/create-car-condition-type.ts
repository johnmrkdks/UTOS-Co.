import formatter from "lodash";
import type { z } from "zod";
import { createCarConditionType } from "@/data/cars-condition-types/create-car-condition-type";
import { getCarConditionTypeByName } from "@/data/cars-condition-types/get-car-condition-type-by-name";
import type { DB } from "@/db";
import {
	type InsertCarConditionType,
	InsertCarConditionTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarConditionTypeServiceSchema = InsertCarConditionTypeSchema;

export type CreateCarConditionTypeParams = z.infer<
	typeof CreateCarConditionTypeServiceSchema
>;

export async function createCarConditionTypeService(
	db: DB,
	data: CreateCarConditionTypeParams,
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
