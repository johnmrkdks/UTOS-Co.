import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";

export async function getCarTransmissionTypeByName(db: DB, name: string) {
	const record = await db.query.carTransmissionTypes.findFirst({
		where: eq(carTransmissionTypes.name, name),
	});

	return record;
}
