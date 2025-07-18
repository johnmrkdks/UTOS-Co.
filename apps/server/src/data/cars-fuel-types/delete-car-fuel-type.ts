import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteCarFuelType(db: DB, id: string) {
	const [deletedCarFuelType] = await db.delete(carFuelTypes).where(eq(carFuelTypes.id, id)).returning();
	return deletedCarFuelType;
}
