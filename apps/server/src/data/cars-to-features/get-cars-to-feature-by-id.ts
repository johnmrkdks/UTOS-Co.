import type { DB } from "@/db";
import { carsToFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarsToFeatureById(
	db: DB,
	carId: string,
) {
	const record = await db.query.carsToFeatures.findFirst({
		where: eq(carsToFeatures.carId, carId),
		with: {
			car: true,
			feature: true,
		},
	});

	return record;
}
