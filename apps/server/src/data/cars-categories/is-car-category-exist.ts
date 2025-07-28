import type { DB } from "@/db";
import { carCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isCarCategoryExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carCategories.findFirst({
		where: eq(carCategories.name, name),
		columns: { id: true },
	});

	return !record;
}
