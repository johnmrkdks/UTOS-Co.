import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";

export async function getCarFuelTypeByName(db: DB, name: string) {
	const record = await db.query.carFuelTypes.findFirst({
		where: eq(carFuelTypes.name, name),
	});

	return record;
}
