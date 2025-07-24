import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { count } from "drizzle-orm";

export async function getCarsCountByConditionTypes(db: DB) {
	return await db
		.select({
			conditionTypeId: cars.conditionTypeId,
			count: count(cars.id).as('count')
		})
		.from(cars)
		.groupBy(cars.conditionTypeId);
}
