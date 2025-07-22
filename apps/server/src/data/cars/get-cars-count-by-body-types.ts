import type { DB } from "@/db";
import { carBodyTypes, cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByBodyTypes(db: DB) {
	return await db.select({
		bodyTypeId: cars.bodyTypeId,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
		.groupBy(cars.bodyTypeId)
}
