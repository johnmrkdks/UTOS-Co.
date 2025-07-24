import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isCarBodyTypeExist(
	db: DB,
	name: string,
): Promise<boolean> {
	const record = await db.query.carBodyTypes.findFirst({
		where: eq(carBodyTypes.name, name),
		columns: { id: true },
	});
	return !record;
}
