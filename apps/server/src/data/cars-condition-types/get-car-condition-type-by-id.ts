import type { DB } from "@/db";
import { carConditionTypes } from "@/db/schema";
import type { CarConditionType } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarConditionTypes(
	db: DB,
	id: string,
): Promise<CarConditionType | null> {
	const record = await db.query.carConditionTypes.findFirst({
		where: eq(carConditionTypes.id, id),
	});

	if (!record) {
		throw new Error("Car condition type not found");
	}

	return record;
}
