import type { DB } from "@/db";
import { packageCategories } from "@/db/schema";
import type { InsertPackageCategory } from "@/schemas/shared";

export async function createPackageCategory(
	db: DB,
	values: InsertPackageCategory,
) {
	const [newCategory] = await db
		.insert(packageCategories)
		.values(values)
		.returning();
	return newCategory;
}
