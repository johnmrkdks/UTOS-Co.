import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByModelId(db: DB, id: string) {
	const [record] = await db
		.select({
			modelId: cars.modelId,
			count: count(cars.id).as('count')
		})
		.from(cars)
		.where(eq(cars.modelId, id))
		.groupBy(cars.modelId);

	return record?.count || 0;
}
