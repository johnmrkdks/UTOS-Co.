import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarModelByName(
	db: DB,
	name: string,
) {
	const record = await db.query.carModels.findFirst({
		where: eq(carModels.name, name),
	});

	return record;
}
