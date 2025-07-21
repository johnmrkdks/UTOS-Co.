import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarBodyType } from "@/schemas/shared";
import { carBodyTypes } from "@/db/schema";

export async function updateCarBodyType(db: DB, id: string, data: UpdateCarBodyType) {
	const [updatedCarBodyType] = await db.update(carBodyTypes).set(data).where(eq(carBodyTypes.id, id)).returning();
	return updatedCarBodyType;
}
