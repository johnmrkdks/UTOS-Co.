import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";

export async function getCarConditionTypeById(db: DB, id: string) {
	const record = await db.query.carConditionTypes.findFirst({
		where: eq(carConditionTypes.id, id),
	});

	return record;
}
