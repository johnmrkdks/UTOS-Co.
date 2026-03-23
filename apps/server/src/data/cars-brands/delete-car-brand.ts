import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carBrands } from "@/db/schema";

export async function deleteCarBrand(db: DB, id: string) {
	const [deletedCarBrand] = await db
		.delete(carBrands)
		.where(eq(carBrands.id, id))
		.returning();
	return deletedCarBrand;
}
