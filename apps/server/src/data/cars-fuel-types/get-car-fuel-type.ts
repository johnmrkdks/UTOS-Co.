import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarFuelType(db: DB, id: string) {
	const [carFuelType] = await db.select().from(carFuelTypes).where(eq(carFuelTypes.id, id));
	return carFuelType;
}
