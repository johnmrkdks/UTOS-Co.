import type { DB } from "@/db";
import { carModels, cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByBrandId(db: DB, brandId: string) {
	return await db.select({
		brandId: carModels.brandId,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.leftJoin(carModels, eq(cars.modelId, carModels.id))
		.where(eq(carModels.brandId, brandId))
		.groupBy(carModels.brandId)
}
