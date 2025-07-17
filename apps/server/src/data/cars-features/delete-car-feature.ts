import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type { CarFeature } from "@/schemas/shared/tables/cars/car-feature";
import { eq } from "drizzle-orm";

export async function deleteCarFeature(
	db: DB,
	id: string,
): Promise<CarFeature> {
	const [record] = await db
		.delete(carFeatures)
		.where(eq(carFeatures.id, id))
		.returning();

	return record;
}
