import type { DB } from "@/db";
import { carModels, cars } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function getCarsCountByBrands(db: DB) {
	return await db.select({
		brandId: carModels.brandId,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.leftJoin(carModels, eq(cars.modelId, carModels.id))
		.groupBy(carModels.brandId)
}
