import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarFeatureByFeature(
	db: DB,
	feature: string,
) {
	const record = await db.query.carFeatures.findFirst({
		where: eq(carFeatures.feature, feature),
	});

	return record;
}
