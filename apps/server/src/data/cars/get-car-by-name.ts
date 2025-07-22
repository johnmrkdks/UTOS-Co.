import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarByName(
	db: DB,
	name: string,
) {
	const record = await db.query.cars.findFirst({
		where: eq(cars.name, name),
	});

	return record;
}
