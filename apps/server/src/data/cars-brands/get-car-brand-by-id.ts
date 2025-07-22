import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarBrandById(
	db: DB,
	id: string,
) {
	const record = await db.query.carBrands.findFirst({
		where: eq(carBrands.id, id),
	});

	return record;
}
