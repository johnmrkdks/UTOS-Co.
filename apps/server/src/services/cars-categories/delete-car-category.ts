import { z } from "zod";
import { getCarsCountByCategoryId } from "@/data/cars/get-cars-count-by-category-id";
import { deleteCarCategory } from "@/data/cars-categories/delete-car-category";
import { getCarCategoryById } from "@/data/cars-categories/get-car-catogory-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const DeleteCarCategoryServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarCategoryParams = z.infer<
	typeof DeleteCarCategoryServiceSchema
>;

export async function deleteCarCategoryService(
	db: DB,
	{ id }: DeleteCarCategoryParams,
) {
	const carCount = await getCarsCountByCategoryId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest(
			"Some entities are using this car category. Please delete them first.",
		);
	}

	const carCategory = await getCarCategoryById(db, id);

	if (!carCategory) {
		throw ErrorFactory.notFound("Car category not found.");
	}

	const deletedCarCategory = await deleteCarCategory(db, id);
	return deletedCarCategory;
}
