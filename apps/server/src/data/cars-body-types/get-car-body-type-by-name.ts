import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";

export async function getCarBodyTypeByName(db: DB, name: string) {
	const record = await db.query.carBodyTypes.findFirst({
		where: eq(carBodyTypes.name, name),
	});

	return record;
}
