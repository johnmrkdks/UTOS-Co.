import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarFeature(db: DB, id: string) {
	const [carFeature] = await db.select().from(carFeatures).where(eq(carFeatures.id, id));
	return carFeature;
}
