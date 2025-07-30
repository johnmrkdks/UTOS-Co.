import type { DB } from "@/db";
import { carsToFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateCarsToFeature } from "@/schemas/shared";

type UpdateCarsToFeatureParams = {
	carId: string;
	data: UpdateCarsToFeature;
};

export async function updateCarToFeature(db: DB, { carId, data }: UpdateCarsToFeatureParams) {
	const [updatedBooking] = await db.update(carsToFeatures).set(data).where(eq(carsToFeatures.carId, carId)).returning();
	return updatedBooking;
}
