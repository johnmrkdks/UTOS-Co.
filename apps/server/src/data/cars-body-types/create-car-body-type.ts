import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type { CarBodyType, InsertCarBodyType } from "@/schemas/shared";

type CreateCarBodyTypeParams = InsertCarBodyType;

export async function createCarBodyType(
	db: DB,
	params: CreateCarBodyTypeParams,
): Promise<CarBodyType> {
	const [record] = await db.insert(carBodyTypes).values(params).returning();

	return record;
}
