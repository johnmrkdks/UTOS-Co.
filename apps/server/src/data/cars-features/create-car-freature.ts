import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type {
	CarFeature,
	InsertCarFeature,
} from "@/schemas/shared";

type CreateCarFeatureParams = InsertCarFeature;

export async function createCarFeature(
	db: DB,
	params: CreateCarFeatureParams,
): Promise<CarFeature> {
	const [record] = await db.insert(carFeatures).values(params).returning();

	return record;
}
