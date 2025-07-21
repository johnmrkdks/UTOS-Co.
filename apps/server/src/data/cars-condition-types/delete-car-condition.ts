import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type { CarConditionType } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function deleteCarConditionType(
	db: DB,
	id: string,
): Promise<CarConditionType> {
	const [record] = await db
		.delete(carConditionTypes)
		.where(eq(carConditionTypes.id, id))
		.returning();

	return record;
}
