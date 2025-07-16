import type { DB } from "@/db";
import { carFeatures, carImages, cars } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Car } from "@/schemas/tables/car";

export async function getCarById(db: DB, id: string): Promise<Car> {
	const [record] = await db
		.select()
		.from(cars)
		.leftJoin(carFeatures, eq(cars.id, carFeatures.carId))
		.leftJoin(carImages, eq(cars.id, carImages.carId))
		.where(eq(cars.id, id));

	if (!record) {
		throw new Error("Car not found");
	}

	return record;
}
