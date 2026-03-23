import formatter from "lodash";
import type { z } from "zod";
import { createCarBodyType } from "@/data/cars-body-types/create-car-body-type";
import { getCarBodyTypeByName } from "@/data/cars-body-types/get-car-body-type-by-name";
import type { DB } from "@/db";
import {
	type CarBodyType,
	type InsertCarBodyType,
	InsertCarBodyTypeSchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarBodyTypeServiceSchema = InsertCarBodyTypeSchema;

export type CreateCarBodyTypeParams = z.infer<
	typeof CreateCarBodyTypeServiceSchema
>;

export async function createCarBodyTypeService(
	db: DB,
	data: CreateCarBodyTypeParams,
) {
	const carBodyType = await getCarBodyTypeByName(db, data.name);

	if (carBodyType) {
		throw ErrorFactory.duplicateEntry("Car body type", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarBodyType;

	const newCarBodyType = createCarBodyType(db, values);

	return newCarBodyType;
}
