import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateCarBrand } from "@/schemas/shared/tables/car-brand";
import { carBrands } from "@/db/schema";

export async function updateCarBrand(db: DB, id: string, data: UpdateCarBrand) {
	const [updatedCarBrand] = await db.update(carBrands).set(data).where(eq(carBrands.id, id)).returning();
	return updatedCarBrand;
}
