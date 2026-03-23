import type { DB } from "@/db";
import { carCategories } from "@/db/schema";
import type { InsertCarCategory } from "@/schemas/shared";

type CreateCarCategoryParams = InsertCarCategory;

export async function createCarCategory(
	db: DB,
	params: CreateCarCategoryParams,
) {
	const [record] = await db.insert(carCategories).values(params).returning();

	return record;
}
