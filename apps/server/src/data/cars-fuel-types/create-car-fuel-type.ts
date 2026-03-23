import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import type { CarFuelType, InsertCarFuelType } from "@/schemas/shared";

type CreateCarFuelTypeParams = InsertCarFuelType;

export async function createCarFuelType(
	db: DB,
	params: CreateCarFuelTypeParams,
): Promise<CarFuelType> {
	const [record] = await db.insert(carFuelTypes).values(params).returning();

	return record;
}
