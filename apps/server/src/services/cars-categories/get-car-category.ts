import { z } from "zod";
import { getCarCategoryById } from "@/data/cars-categories/get-car-catogory-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarCategoryServiceSchema = z.object({
	id: z.string(),
});

export type GetCarCategoryByIdParams = z.infer<
	typeof GetCarCategoryServiceSchema
>;

export async function getCarCategoryService(
	db: DB,
	{ id }: GetCarCategoryByIdParams,
) {
	const carCategory = await getCarCategoryById(db, id);

	if (!carCategory) {
		throw ErrorFactory.notFound("Car category not found.");
	}

	return carCategory;
}
