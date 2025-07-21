import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";
import type { CarTransmissionType } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarTranmissionType(
	db: DB,
	id: string,
): Promise<CarTransmissionType | null> {
	const record = await db.query.carTransmissionTypes.findFirst({
		where: eq(carTransmissionTypes.id, id),
	});

	if (!record) {
		throw new Error("Car transmission type not found");
	}

	return record;
}
