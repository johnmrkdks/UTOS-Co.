import type { DB } from "@/db";
import { carCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarCategoryByName(
	db: DB,
	name: string,
) {
	const record = await db.query.carCategories.findFirst({
		where: eq(carCategories.name, name),
	});

	return record;
}
