import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type { CarModel } from "@/schemas/shared";
import { eq } from "drizzle-orm";

export async function getCarModelById(
	db: DB,
	id: string,
) {
	const record = await db.query.carModels.findFirst({
		where: eq(carModels.id, id),
	});

	return record;
}
