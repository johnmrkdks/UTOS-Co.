import type { DB } from "@/db";
import { carFeatures, carImages, cars } from "@/db/schema";
import type { Car, InsertCar } from "@/schemas/tables/car";
import { getTableColumns } from "drizzle-orm";

type CreateCarParams = InsertCar;

export async function createCar(db: DB, params: CreateCarParams): Promise<Car> {
	const [record] = await db.insert(cars).values(params).returning();

	return record;
}
