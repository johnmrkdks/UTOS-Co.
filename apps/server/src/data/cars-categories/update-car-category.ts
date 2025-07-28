import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarCategory } from "@/schemas/shared";
import { carCategories } from "@/db/schema";

type UpdateCarCategoriesParams = {
	id: string;
	data: UpdateCarCategory;
};

export async function updateCarCategory(db: DB, { id, data }: UpdateCarCategoriesParams) {
	const [updatedCarCategory] = await db.update(carCategories).set(data).where(eq(carCategories.id, id)).returning();
	return updatedCarCategory;
}
