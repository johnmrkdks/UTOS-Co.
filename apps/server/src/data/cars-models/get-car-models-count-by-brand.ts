import { count } from "drizzle-orm";
import type { DB } from "@/db";
import { carModels } from "@/db/schema";

export async function getCarModelsCountByBrands(db: DB) {
	return await db
		.select({
			brandId: carModels.brandId,
			count: count(carModels.id).as("count"),
		})
		.from(carModels)
		.groupBy(carModels.brandId);
}
