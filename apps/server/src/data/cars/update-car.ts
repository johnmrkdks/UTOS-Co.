import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car, UpdateCar } from "@/schemas/shared/tables/car";
import { eq } from "drizzle-orm";

type UpdateCarParams = {
	id: string;
	data: Partial<UpdateCar>;
};

export async function updateCar(db: DB, params: UpdateCarParams): Promise<Car> {
	const { id, data } = params;

	const [record] = await db
		.update(cars)
		.set(data)
		.where(eq(cars.id, id))
		.returning();

	return record;
}
