import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";

export async function isCarConditionTypeExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carConditionTypes.findFirst({
		where: eq(carConditionTypes.name, name),
		columns: { id: true },
	});
	return !record;
}
