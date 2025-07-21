import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarTransmissionType } from "@/schemas/shared";
import { carTransmissionTypes } from "@/db/schema";

export async function updateCarTransmissionType(db: DB, id: string, data: UpdateCarTransmissionType) {
	const [updatedCarTransmissionType] = await db.update(carTransmissionTypes).set(data).where(eq(carTransmissionTypes.id, id)).returning();
	return updatedCarTransmissionType;
}
