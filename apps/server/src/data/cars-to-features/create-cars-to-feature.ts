import type { DB } from "@/db";
import { carsToFeatures } from "@/db/schema";
import type { InsertCarsToFeature } from "@/schemas/shared";

type CreateCarsToFeatureParams = InsertCarsToFeature;

export async function createCarsToFeature(db: DB, params: CreateCarsToFeatureParams) {
	const [record] = await db.insert(carsToFeatures).values(params).returning();

	return record;
}
