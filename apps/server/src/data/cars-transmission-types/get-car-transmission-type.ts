import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarTransmissionType(db: DB, id: string) {
	const [carTransmissionType] = await db.select().from(carTransmissionTypes).where(eq(carTransmissionTypes.id, id));
	return carTransmissionType;
}
