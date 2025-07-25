import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarModelUsage(db: DB, id: string) {
	const carsUsingModel = await db.query.cars.findMany({
		where: eq(cars.modelId, id),
	});

	const carCount = carsUsingModel.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingModel.length,
		isInUse,
		cars: carsUsingModel,
	};
}
