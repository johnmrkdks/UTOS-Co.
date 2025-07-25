import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarTransmissionTypeUsage(db: DB, id: string) {
	const carsUsingTransmissionType = await db.query.cars.findMany({
		where: eq(cars.transmissionTypeId, id),
	});

	const carCount = carsUsingTransmissionType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingTransmissionType.length,
		isInUse,
		cars: carsUsingTransmissionType,
	};
}
