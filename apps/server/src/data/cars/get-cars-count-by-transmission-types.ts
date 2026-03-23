import { count } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarsCountByTransmissionTypes(db: DB) {
	return await db
		.select({
			transmissionTypeId: cars.transmissionTypeId,
			count: count(cars.id).as("count"),
		})
		.from(cars)
		.groupBy(cars.transmissionTypeId);
}
