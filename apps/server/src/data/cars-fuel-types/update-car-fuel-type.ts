import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarFuelType } from "@/schemas/shared";
import { carFuelTypes } from "@/db/schema";

type UpdateCarFuelTypeParams = {
	id: string;
	data: UpdateCarFuelType;
};

export async function updateCarFuelType(db: DB, { id, data }: UpdateCarFuelTypeParams) {
	const [updatedCarFuelType] = await db.update(carFuelTypes).set(data).where(eq(carFuelTypes.id, id)).returning();
	return updatedCarFuelType;
}
