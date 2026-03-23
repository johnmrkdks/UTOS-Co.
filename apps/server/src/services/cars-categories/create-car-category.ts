import formatter from "lodash";
import type { z } from "zod";
import { createCarCategory } from "@/data/cars-categories/create-car-category";
import { getCarDriveTypeByName } from "@/data/cars-drive-types/get-car-drive-type-by-name";
import type { DB } from "@/db";
import {
	type InsertCarCategory,
	InsertCarCategorySchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreateCarCategoryServiceSchema = InsertCarCategorySchema;

export type CreateCarCategoryParams = z.infer<
	typeof CreateCarCategoryServiceSchema
>;

export async function createCarCategoryService(
	db: DB,
	data: CreateCarCategoryParams,
) {
	const carCategoryName = await getCarDriveTypeByName(db, data.name);

	if (carCategoryName) {
		throw ErrorFactory.duplicateEntry("Car category", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarCategory;

	const newCarCategory = createCarCategory(db, values);

	return newCarCategory;
}
