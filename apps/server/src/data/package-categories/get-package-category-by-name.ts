import type { DB } from "@/db";
import { packageCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPackageCategoryByName(db: DB, name: string) {
	const category = await db
		.select()
		.from(packageCategories)
		.where(eq(packageCategories.name, name))
		.limit(1);

	return category[0] || null;
}