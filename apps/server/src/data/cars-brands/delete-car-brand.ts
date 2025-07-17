import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type { CarBrand } from "@/schemas/shared/tables/cars/car-brand";
import { eq } from "drizzle-orm";

export async function deleteCarBrand(db: DB, id: string): Promise<CarBrand> {
	const [record] = await db
		.delete(carBrands)
		.where(eq(carBrands.id, id))
		.returning();

	return record;
}
