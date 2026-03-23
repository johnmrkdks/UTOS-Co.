import formatter from "lodash";
import { z } from "zod";
import { getCarCategoryById } from "@/data/cars-categories/get-car-catogory-by-id";
import { updateCarCategory } from "@/data/cars-categories/update-car-category";
import type { DB } from "@/db";
import {
	type UpdateCarCategory,
	UpdateCarCategorySchema,
} from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const UpdateCarCategoryServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarCategorySchema,
});

export type UpdateCarCategoryParams = z.infer<
	typeof UpdateCarCategoryServiceSchema
>;

export async function updateCarCategoryService(
	db: DB,
	{ id, data }: UpdateCarCategoryParams,
) {
	const carCategory = await getCarCategoryById(db, id);

	if (!carCategory) {
		throw ErrorFactory.notFound("Car category not found.");
	}

	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarCategory;

	const updatedCarCategory = await updateCarCategory(db, { id, data: values });

	return updatedCarCategory;
}
