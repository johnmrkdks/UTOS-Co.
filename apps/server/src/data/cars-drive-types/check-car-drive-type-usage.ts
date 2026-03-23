import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function checkCarDriveTypeUsage(db: DB, id: string) {
	const carsUsingDriveType = await db.query.cars.findMany({
		where: eq(cars.driveTypeId, id),
	});

	const carCount = carsUsingDriveType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingDriveType.length,
		isInUse,
		cars: carsUsingDriveType,
	};
}
