import type { DB } from "@/db";
import { cars, carFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCarFeatureUsage(db: DB, id: string) {
	const carsUsingFeature = await db.query.cars.findMany({
		with: {
			carsToFeatures: {
				with: {
					feature: true,
				}
			}
		},
	});

	const carCount = carsUsingFeature.length;
	const isInUse = carCount > 0;

	return {
		carCount,
		totalUsages: carsUsingFeature.length,
		isInUse,
		cars: carsUsingFeature,
	};
}
