import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carBrands } from "@/db/schema";

export async function getCarBrandByName(db: DB, name: string) {
	const record = await db.query.carBrands.findFirst({
		where: eq(carBrands.name, name),
	});

	return record;
}
