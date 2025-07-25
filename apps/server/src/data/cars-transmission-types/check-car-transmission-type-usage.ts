import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarTransmissionTypeUsage(db: DB, id: string) {
	const carsUsingTransmissionType = await db.query.cars.findMany({
		where: eq(cars.transmissionTypeId, id),
	});

	const carModelsCount = 0; // car transmission types are not linked to car models
	const carCount = carsUsingTransmissionType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingTransmissionType,
	};
}
