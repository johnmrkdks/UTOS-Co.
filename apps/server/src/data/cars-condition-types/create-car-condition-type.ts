import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type { CarConditionType, InsertCarConditionType } from "@/schemas/shared/tables/car-condition-type";
import { carConditionTypes } from "@/db/schema";

type CreateCarConditionTypeParams = InsertCarConditionType;

export async function createCarConditionType(db: DB, params: CreateCarConditionTypeParams): Promise<CarConditionType> {
	const [record] = await db.insert(carConditionTypes).values(params).returning();

	return record;
}
