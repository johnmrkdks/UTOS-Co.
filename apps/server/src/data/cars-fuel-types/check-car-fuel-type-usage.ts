import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function checkCarFuelTypeUsage(db: DB, id: string) {
	const carsUsingFuelType = await db.query.cars.findMany({
		where: eq(cars.fuelTypeId, id),
	});

	const carCount = carsUsingFuelType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingFuelType.length,
		isInUse,
		cars: carsUsingFuelType,
	};
}
