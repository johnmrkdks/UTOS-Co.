import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarsQuery(db: DB) {
	return await db.select().from(cars);
}
