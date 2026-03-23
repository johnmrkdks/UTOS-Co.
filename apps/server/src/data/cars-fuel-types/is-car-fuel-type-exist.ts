import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";

export async function isCarFuelTypeExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carFuelTypes.findFirst({
		where: eq(carFuelTypes.name, name),
		columns: { id: true },
	});
	return !record;
}
