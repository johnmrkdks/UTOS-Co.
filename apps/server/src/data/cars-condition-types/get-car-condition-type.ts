import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarConditionType(db: DB, id: string) {
	const [carConditionType] = await db.select().from(carConditionTypes).where(eq(carConditionTypes.id, id));
	return carConditionType;
}
