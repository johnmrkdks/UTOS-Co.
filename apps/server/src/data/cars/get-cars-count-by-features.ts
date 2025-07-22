import type { DB } from "@/db";
import { carFeatures, cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByFeatures(db: DB) {
	return await db.select({
		featureId: carFeatures.id,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.innerJoin(carFeatures, eq(cars.id, carFeatures.carId))
		.groupBy(carFeatures.id)
}
