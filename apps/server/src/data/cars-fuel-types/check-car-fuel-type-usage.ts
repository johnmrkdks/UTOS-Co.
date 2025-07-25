import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarFuelTypeUsage(db: DB, id: string) {
	const carsUsingFuelType = await db.query.cars.findMany({
		where: eq(cars.fuelTypeId, id),
	});

	const carModelsCount = 0; // car fuel types are not linked to car models
	const carCount = carsUsingFuelType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingFuelType,
	};
}
