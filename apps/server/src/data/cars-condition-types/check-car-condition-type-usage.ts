import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function checkCarConditionTypeUsage(db: DB, id: string) {
	const carsUsingConditionType = await db.query.cars.findMany({
		where: eq(cars.conditionTypeId, id),
	});

	const carCount = carsUsingConditionType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingConditionType.length,
		isInUse,
		cars: carsUsingConditionType,
	};
}
