import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import type { CarFuelType } from "@/schemas/shared/tables/cars/car-fuel-type";
import { eq } from "drizzle-orm";

export async function deleteCarFuelType(
	db: DB,
	id: string,
): Promise<CarFuelType> {
	const [record] = await db
		.delete(carFuelTypes)
		.where(eq(carFuelTypes.id, id))
		.returning();

	return record;
}
