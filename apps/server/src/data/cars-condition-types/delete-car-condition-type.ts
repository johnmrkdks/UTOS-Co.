import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";

export async function deleteCarConditionType(db: DB, id: string) {
	const [deletedCarConditionType] = await db
		.delete(carConditionTypes)
		.where(eq(carConditionTypes.id, id))
		.returning();
	return deletedCarConditionType;
}
