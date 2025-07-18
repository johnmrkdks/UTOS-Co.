import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarBrand(db: DB, id: string) {
	const [carBrand] = await db.select().from(carBrands).where(eq(carBrands.id, id));
	return carBrand;
}
