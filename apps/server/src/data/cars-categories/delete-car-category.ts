import type { DB } from "@/db";
import { carCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteCarCategory(db: DB, id: string) {
	const [deletedCarCategory] = await db.delete(carCategories).where(eq(carCategories.id, id)).returning();
	return deletedCarCategory;
}
