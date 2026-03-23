import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";

export async function deleteCarTransmissionType(db: DB, id: string) {
	const [deletedCarTransmissionType] = await db
		.delete(carTransmissionTypes)
		.where(eq(carTransmissionTypes.id, id))
		.returning();
	return deletedCarTransmissionType;
}
