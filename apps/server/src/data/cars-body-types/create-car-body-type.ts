import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type {
	CarBodyType,
	InsertCarBodyType,
} from "@/schemas/shared/tables/cars/car-body-type";

type CreateCarBodyTypeParams = InsertCarBodyType;

export async function createCarBodyTypes(
	db: DB,
	params: CreateCarBodyTypeParams,
): Promise<CarBodyType> {
	const [record] = await db.insert(carBodyTypes).values(params).returning();

	return record;
}
