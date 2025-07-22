import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarConditionTypeByName(
	db: DB,
	name: string,
) {
	const record = await db.query.carConditionTypes.findFirst({
		where: eq(carConditionTypes.name, name),
	});

	return record;
}
