import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";

export async function getCarTransmissionTypeById(db: DB, id: string) {
	const record = await db.query.carTransmissionTypes.findFirst({
		where: eq(carTransmissionTypes.id, id),
	});

	return record;
}
