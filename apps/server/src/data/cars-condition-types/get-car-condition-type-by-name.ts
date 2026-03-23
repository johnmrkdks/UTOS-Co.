import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";

export async function getCarConditionTypeByName(db: DB, name: string) {
	const record = await db.query.carConditionTypes.findFirst({
		where: eq(carConditionTypes.name, name),
	});

	return record;
}
