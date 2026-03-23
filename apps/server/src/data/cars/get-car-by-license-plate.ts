import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/sqlite/schema/cars";

export async function getCarByLicensePlate(db: DB, licensePlate: string) {
	const [car] = await db
		.select()
		.from(cars)
		.where(eq(cars.licensePlate, licensePlate))
		.limit(1);

	return car;
}
