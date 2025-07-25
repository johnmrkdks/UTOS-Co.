import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarModelUsage(db: DB, id: string) {
	const carsUsingModel = await db.query.cars.findMany({
		where: eq(cars.modelId, id),
	});

	const carModelsCount = 0; // car models are not linked to other car models
	const carCount = carsUsingModel.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingModel,
	};
}
