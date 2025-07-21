import type { DB } from "@/db";
import type { CarFeature, InsertCarFeature } from "@/schemas/shared";
import { carFeatures } from "@/db/schema";

type CreateCarFeatureParams = InsertCarFeature;

export async function createCarFeature(db: DB, params: CreateCarFeatureParams): Promise<CarFeature> {
	const [record] = await db.insert(carFeatures).values(params).returning();

	return record;
}
