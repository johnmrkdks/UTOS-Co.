import { createCarBodyType } from "@/data/cars-body-types/create-car-body-type";
import { getCarBodyTypeByName } from "@/data/cars-body-types/get-car-body-type-by-name";
import type { DB } from "@/db";
import { InsertCarBodyTypeSchema, type CarBodyType, type InsertCarBodyType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarBodyTypeServiceSchema = InsertCarBodyTypeSchema

export async function createCarBodyTypeService(
	db: DB,
	data: z.infer<typeof CreateCarBodyTypeServiceSchema>,
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
