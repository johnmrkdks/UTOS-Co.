import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";

export async function deleteCarFeature(db: DB, id: string) {
	const [deletedCarFeature] = await db
		.delete(carFeatures)
		.where(eq(carFeatures.id, id))
		.returning();
	return deletedCarFeature;
}
