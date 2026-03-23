import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFuelTypes, cars } from "@/db/schema";

export async function getCarsCountByFuelTypes(db: DB) {
	return await db
		.select({
			fuelTypeId: cars.fuelTypeId,
			count: count(cars.id).as("count"),
		})
		.from(cars)
		.innerJoin(carFuelTypes, eq(cars.fuelTypeId, carFuelTypes.id))
		.groupBy(cars.fuelTypeId);
}
