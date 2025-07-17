import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type { CarTransmissionType } from "@/schemas/shared/tables/cars/car-transmission-type";
import { eq } from "drizzle-orm";

export async function deleteCarTransmissionType(
	db: DB,
	id: string,
): Promise<CarTransmissionType> {
	const [record] = await db
		.delete(carTransmissionTypes)
		.where(eq(carTransmissionTypes.id, id))
		.returning();

	return record;
}
