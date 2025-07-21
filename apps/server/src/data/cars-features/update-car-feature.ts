import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarFeature } from "@/schemas/shared";
import { carFeatures } from "@/db/schema";

export async function updateCarFeature(db: DB, id: string, data: UpdateCarFeature) {
	const [updatedCarFeature] = await db.update(carFeatures).set(data).where(eq(carFeatures.id, id)).returning();
	return updatedCarFeature;
}
