import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByFuelTypeId = async (db: DB, fuelTypeId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.fuelTypeId, fuelTypeId));

	return result.value;
};
