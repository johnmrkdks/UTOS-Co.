import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car, InsertCar } from "@/schemas/shared/tables/car";

type CreateCarParams = InsertCar;

export async function createCar(db: DB, params: CreateCarParams): Promise<Car> {
	const [record] = await db.insert(cars).values(params).returning();

	return record;
}
