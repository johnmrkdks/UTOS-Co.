import { count } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarsCountByCategories(db: DB) {
	return await db
		.select({
			categoryId: cars.categoryId,
			count: count(cars.id).as("count"),
		})
		.from(cars)
		.groupBy(cars.categoryId);
}
