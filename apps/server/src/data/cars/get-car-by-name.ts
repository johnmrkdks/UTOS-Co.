import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export async function getCarByName(db: DB, name: string) {
	const record = await db.query.cars.findFirst({
		where: eq(cars.name, name),
	});

	return record;
}
