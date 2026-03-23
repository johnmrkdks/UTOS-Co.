import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carCategories } from "@/db/schema";

export async function getCarCategoryById(db: DB, id: string) {
	const record = await db.query.carCategories.findFirst({
		where: eq(carCategories.id, id),
	});

	return record;
}
