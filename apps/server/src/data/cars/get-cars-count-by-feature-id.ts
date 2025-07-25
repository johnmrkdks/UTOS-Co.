import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";

export const getCarsCountByFeatureId = async (db: DB, featureId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(carFeatures)
		.where(eq(carFeatures.id, featureId))

	return result.value;
};
