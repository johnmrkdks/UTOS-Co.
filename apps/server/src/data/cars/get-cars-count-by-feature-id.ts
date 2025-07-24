import type { DB } from "@/db";
import { carFeatures, cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByFeatureId(db: DB, id: string) {
	const [record] = await db.select({
		featureId: carFeatures.id,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.innerJoin(carFeatures, eq(cars.id, carFeatures.carId))
		.where(eq(carFeatures.id, id))
		.groupBy(carFeatures.id)

	return record?.count || 0;
}
