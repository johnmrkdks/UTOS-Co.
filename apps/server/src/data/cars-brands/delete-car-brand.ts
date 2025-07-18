import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteCarBrand(db: DB, id: string) {
	const [deletedCarBrand] = await db.delete(carBrands).where(eq(carBrands.id, id)).returning();
	return deletedCarBrand;
}
