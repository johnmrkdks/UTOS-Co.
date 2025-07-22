import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarModelsCountByBrandId(db: DB, id: string) {
	return await db
		.select({
			brandId: carModels.brandId,
			count: count(carModels.id).as('count')
		})
		.from(carModels)
		.where(eq(carModels.brandId, id))
		.groupBy(carModels.brandId);
}
