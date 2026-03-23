import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type { UpdateCarConditionType } from "@/schemas/shared";

type UpdateCarConditionTypeParams = {
	id: string;
	data: UpdateCarConditionType;
};

export async function updateCarConditionType(
	db: DB,
	{ id, data }: UpdateCarConditionTypeParams,
) {
	const [updatedCarConditionType] = await db
		.update(carConditionTypes)
		.set(data)
		.where(eq(carConditionTypes.id, id))
		.returning();
	return updatedCarConditionType;
}
