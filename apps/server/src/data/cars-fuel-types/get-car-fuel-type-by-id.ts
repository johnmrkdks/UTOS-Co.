import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarFuelTypeById(
	db: DB,
	id: string,
) {
	const record = await db.query.carFuelTypes.findFirst({
		where: eq(carFuelTypes.id, id),
	});

	return record;
}
