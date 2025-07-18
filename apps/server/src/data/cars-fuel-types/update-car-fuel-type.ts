import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateCarFuelType } from "@/schemas/shared/tables/car-fuel-type";
import { carFuelTypes } from "@/db/schema";

export async function updateCarFuelType(db: DB, id: string, data: UpdateCarFuelType) {
	const [updatedCarFuelType] = await db.update(carFuelTypes).set(data).where(eq(carFuelTypes.id, id)).returning();
	return updatedCarFuelType;
}
