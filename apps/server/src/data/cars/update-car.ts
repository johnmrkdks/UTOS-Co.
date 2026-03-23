import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car, UpdateCar } from "@/schemas/shared";

type UpdateCarParams = {
	id: string;
	data: UpdateCar;
};

export async function updateCar(db: DB, { id, data }: UpdateCarParams) {
	const [record] = await db
		.update(cars)
		.set({
			...data,
			status: data.status as Car["status"],
		})
		.where(eq(cars.id, id))
		.returning();

	return record;
}
