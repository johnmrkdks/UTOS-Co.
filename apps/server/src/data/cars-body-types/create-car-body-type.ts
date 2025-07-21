import type { DB } from "@/db";
import type { CarBodyType, InsertCarBodyType } from "@/schemas/shared";
import { carBodyTypes } from "@/db/schema";

type CreateCarBodyTypeParams = InsertCarBodyType;

export async function createCarBodyType(db: DB, params: CreateCarBodyTypeParams): Promise<CarBodyType> {
	const [record] = await db.insert(carBodyTypes).values(params).returning();

	return record;
}
