import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carModels } from "@/db/schema";

export async function isCarModelExist(db: DB, name: string): Promise<boolean> {
	const record = await db.query.carModels.findFirst({
		where: eq(carModels.name, name),
		columns: { id: true },
	});
	return !record;
}
