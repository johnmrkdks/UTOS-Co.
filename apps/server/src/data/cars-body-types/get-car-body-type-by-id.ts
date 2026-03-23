import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarBodyTypeById(db: DB, id: string) {
	const record = await db.query.carBodyTypes.findFirst({
		where: eq(cars.id, id),
	});

	return record;
}
