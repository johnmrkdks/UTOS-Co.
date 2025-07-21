import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import type { CarFeature } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarFeatureById(
	db: DB,
	id: string,
): Promise<CarFeature | null> {
	const record = await db.query.carFeatures.findFirst({
		where: eq(carFeatures.id, id),
	});

	if (!record) {
		throw new Error("Car feature not found");
	}

	return record;
}
