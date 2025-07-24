import type { DB } from "@/db";
import { carBodyTypes, cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByBodyTypeId(db: DB, id: string) {
	const [record] = await db.select({
		bodyTypeId: cars.bodyTypeId,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.innerJoin(carBodyTypes, eq(cars.bodyTypeId, carBodyTypes.id))
		.where(eq(carBodyTypes.id, id))
		.groupBy(cars.bodyTypeId)

	return record?.count || 0;
}
