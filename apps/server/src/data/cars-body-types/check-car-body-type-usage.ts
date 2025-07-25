import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarBodyTypeUsage(db: DB, id: string) {
	const carsUsingBodyType = await db.query.cars.findMany({
		where: eq(cars.bodyTypeId, id),
	});

	const carModelsCount = 0;
	const carCount = carsUsingBodyType.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingBodyType,
	};
}
