import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarConditionTypeUsage(db: DB, id: string) {
	const carsUsingConditionType = await db.query.cars.findMany({
		where: eq(cars.conditionTypeId, id),
	});

	const carModelsCount = 0; // car condition types are not linked to car models
	const carCount = carsUsingConditionType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingConditionType,
	};
}
