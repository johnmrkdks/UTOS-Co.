import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carsToFeatures } from "@/db/schema";

export async function deleteCarsToFeaure(db: DB, carId: string) {
	const [deletedCarsToFeaure] = await db
		.delete(carsToFeatures)
		.where(eq(carsToFeatures.carId, carId))
		.returning();
	return deletedCarsToFeaure;
}
