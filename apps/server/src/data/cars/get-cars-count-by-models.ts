import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { count } from "drizzle-orm";

export async function getCarsCountByModels(db: DB) {
	return await db
		.select({
			modelId: cars.modelId,
			count: count(cars.id).as('count')
		})
		.from(cars)
		.groupBy(cars.modelId);
}
