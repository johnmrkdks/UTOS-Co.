import type { DB } from "@/db";
import { cars, carFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarFeatureUsage(db: DB, id: string) {
	const carsUsingFeature = await db.query.cars.findMany({
		where: eq(cars.id, carFeatures.carId),
		with: {
			features: {
				where: eq(carFeatures.id, id),
			}
		},
	});

	const carModelsCount = 0; // car features are not linked to car models
	const carCount = carsUsingFeature.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		carModelsCount,
		isInUse,
		cars: carsUsingFeature,
	};
}
