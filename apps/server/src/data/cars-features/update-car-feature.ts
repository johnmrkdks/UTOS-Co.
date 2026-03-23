import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type { UpdateCarFeature } from "@/schemas/shared";

type UpdateCarFeatureParams = {
	id: string;
	data: UpdateCarFeature;
};

export async function updateCarFeature(
	db: DB,
	{ id, data }: UpdateCarFeatureParams,
) {
	const [updatedCarFeature] = await db
		.update(carFeatures)
		.set(data)
		.where(eq(carFeatures.id, id))
		.returning();
	return updatedCarFeature;
}
