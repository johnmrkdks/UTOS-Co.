import type { DB } from "@/db";
import type { InsertCarCategory } from "@/schemas/shared";
import { carCategories } from "@/db/schema";

type CreateCarCategoryParams = InsertCarCategory;

export async function createCarCategory(db: DB, params: CreateCarCategoryParams) {
	const [record] = await db.insert(carCategories).values(params).returning();

	return record;
}
