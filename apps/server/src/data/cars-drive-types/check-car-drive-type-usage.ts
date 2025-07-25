import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarDriveTypeUsage(db: DB, id: string) {
	const carsUsingDriveType = await db.query.cars.findMany({
		where: eq(cars.driveTypeId, id),
	});

	const carModelsCount = 0; // car drive types are not linked to car models
	const carCount = carsUsingDriveType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingDriveType,
	};
}
