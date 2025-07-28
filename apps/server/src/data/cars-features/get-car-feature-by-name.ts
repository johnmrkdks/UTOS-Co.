import type { DB } from "@/db";
import { carFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarFeatureByName(
	db: DB,
	name: string,
) {
	const record = await db.query.carFeatures.findFirst({
		where: eq(carFeatures.name, name),
	});

	return record;
}
