import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByDriveTypeId(db: DB, id: string) {
	return await db
		.select({
			driveTypeId: cars.driveTypeId,
			count: count(cars.id).as('count')
		})
		.from(cars)
		.where(eq(cars.driveTypeId, id))
		.groupBy(cars.driveTypeId);
}
