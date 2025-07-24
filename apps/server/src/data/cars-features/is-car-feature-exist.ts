import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isCarFeatureExist(
	db: DB,
	feature: string,
): Promise<boolean> {
	const record = await db.query.carFeatures.findFirst({
		where: eq(carFeatures.feature, feature),
		columns: { id: true },
	});
	return !record;
}
