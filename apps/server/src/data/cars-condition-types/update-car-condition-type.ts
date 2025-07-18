import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateCarConditionType } from "@/schemas/shared/tables/car-condition-type";
import { carConditionTypes } from "@/db/schema";

export async function updateCarConditionType(db: DB, id: string, data: UpdateCarConditionType) {
	const [updatedCarConditionType] = await db.update(carConditionTypes).set(data).where(eq(carConditionTypes.id, id)).returning();
	return updatedCarConditionType;
}
