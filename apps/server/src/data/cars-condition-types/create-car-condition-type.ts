import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type {
	CarConditionType,
	InsertCarConditionType,
} from "@/schemas/shared";

type CreateCarConditionTypeParams = InsertCarConditionType;

export async function createCarConditionType(
	db: DB,
	params: CreateCarConditionTypeParams,
): Promise<CarConditionType> {
	const [record] = await db
		.insert(carConditionTypes)
		.values(params)
		.returning();

	return record;
}
