import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByTransmissionTypeId(db: DB, id: string) {
	const [record] = await db
		.select({
			transmissionTypeId: cars.transmissionTypeId,
			count: count(cars.id).as('count')
		})
		.from(cars)
		.where(eq(cars.transmissionTypeId, id))
		.groupBy(cars.transmissionTypeId);

	return record?.count || 0;
}
