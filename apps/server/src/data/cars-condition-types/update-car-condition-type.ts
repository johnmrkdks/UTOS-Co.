import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type {
	CarConditionType,
	UpdateCarConditionType,
} from "@/schemas/shared/tables/cars/car-condition-type";
import { eq } from "drizzle-orm";

type UpdateCarConditionTypeParams = {
	id: string;
	data: Partial<UpdateCarConditionType>;
};

export async function updateCarConditionType(
	db: DB,
	params: UpdateCarConditionTypeParams,
): Promise<CarConditionType> {
	const { id, data } = params;

	const [record] = await db
		.update(carConditionTypes)
		.set(data)
		.where(eq(carConditionTypes.id, id))
		.returning();

	return record;
}
