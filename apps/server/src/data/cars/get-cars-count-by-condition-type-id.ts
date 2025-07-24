import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByConditionTypeId(db: DB, id: string) {
	const [record] = await db
		.select({
			conditionTypeId: cars.conditionTypeId,
			count: count(cars.id).as('count')
		})
		.from(cars)
		.where(eq(cars.conditionTypeId, id))
		.groupBy(cars.conditionTypeId);

	return record?.count || 0;
}
