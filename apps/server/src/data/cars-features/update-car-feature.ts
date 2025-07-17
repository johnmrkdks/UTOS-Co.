import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type {
	CarFeature,
	UpdateCarFeature,
} from "@/schemas/shared/tables/cars/car-feature";
import { eq } from "drizzle-orm";

type UpdateCarFeatureParams = {
	id: string;
	data: Partial<UpdateCarFeature>;
};

export async function updateCarFeature(
	db: DB,
	params: UpdateCarFeatureParams,
): Promise<CarFeature> {
	const { id, data } = params;

	const [record] = await db
		.update(carFeatures)
		.set(data)
		.where(eq(carFeatures.id, id))
		.returning();

	return record;
}
