import { count } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarsCountByDriveTypes(db: DB) {
	return await db
		.select({
			driveTypeId: cars.driveTypeId,
			count: count(cars.id).as("count"),
		})
		.from(cars)
		.groupBy(cars.driveTypeId);
}
