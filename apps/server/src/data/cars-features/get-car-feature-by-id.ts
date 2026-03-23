import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";

export async function getCarFeatureById(db: DB, id: string) {
	const record = await db.query.carFeatures.findFirst({
		where: eq(carFeatures.id, id),
	});

	return record;
}
