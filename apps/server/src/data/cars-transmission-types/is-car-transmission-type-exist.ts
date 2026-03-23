import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carTransmissionTypes } from "@/db/schema";

export async function isCarTransmissionTypeExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carTransmissionTypes.findFirst({
		where: eq(carTransmissionTypes.name, name),
		columns: { id: true },
	});
	return !record;
}
