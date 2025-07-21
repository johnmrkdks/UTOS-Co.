import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarConditionType } from "@/schemas/shared";
import { carConditionTypes } from "@/db/schema";

type UpdateCarConditionTypeParams = {
	id: string;
	data: UpdateCarConditionType;
};

export async function updateCarConditionType(db: DB, { id, data }: UpdateCarConditionTypeParams) {
	const [updatedCarConditionType] = await db.update(carConditionTypes).set(data).where(eq(carConditionTypes.id, id)).returning();
	return updatedCarConditionType;
}
