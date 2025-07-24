import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isCarBrandExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carBrands.findFirst({
		where: eq(carBrands.name, name),
		columns: { id: true },
	});
	return !record;
}
