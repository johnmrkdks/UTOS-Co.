import type { DB } from "@/db";
import type { CarFuelType, InsertCarFuelType } from "@/schemas/shared";
import { carFuelTypes } from "@/db/schema";

type CreateCarFuelTypeParams = InsertCarFuelType;

export async function createCarFuelType(db: DB, params: CreateCarFuelTypeParams): Promise<CarFuelType> {
	const [record] = await db.insert(carFuelTypes).values(params).returning();

	return record;
}
