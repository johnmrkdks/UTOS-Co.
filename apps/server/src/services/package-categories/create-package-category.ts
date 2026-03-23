import formatter from "lodash";
import { z } from "zod";
import { createPackageCategory } from "@/data/package-categories/create-package-category";
import { getPackageCategoryByName } from "@/data/package-categories/get-package-category-by-name";
import type { DB } from "@/db";
import type { InsertPackageCategory } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

export const CreatePackageCategoryServiceSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	displayOrder: z.number().optional(),
});

export type CreatePackageCategoryParams = z.infer<
	typeof CreatePackageCategoryServiceSchema
>;

export async function createPackageCategoryService(
	db: DB,
	data: CreatePackageCategoryParams,
) {
	const existingCategory = await getPackageCategoryByName(db, data.name);

	if (existingCategory) {
		throw ErrorFactory.duplicateEntry("Package Category", "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertPackageCategory;

	const newCategory = createPackageCategory(db, values);

	return newCategory;
}
