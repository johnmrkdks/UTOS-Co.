import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type { CarModel } from "@/schemas/shared/tables/cars/car-model";
import { eq } from "drizzle-orm";

export async function deleteCarModel(db: DB, id: string): Promise<CarModel> {
	const [record] = await db
		.delete(carModels)
		.where(eq(carModels.id, id))
		.returning();

	return record;
}
