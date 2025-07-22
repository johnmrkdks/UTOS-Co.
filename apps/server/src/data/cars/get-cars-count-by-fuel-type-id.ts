import type { DB } from "@/db";
import { carFuelTypes, cars } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function getCarsCountByFuelTypeId(db: DB, id: string) {
	return await db.select({
		fuelTypeId: cars.fuelTypeId,
		count: count(cars.id).as('count')
	})
		.from(cars)
		.innerJoin(carFuelTypes, eq(cars.fuelTypeId, carFuelTypes.id))
		.where(eq(carFuelTypes.id, id))
		.groupBy(cars.fuelTypeId)
}
