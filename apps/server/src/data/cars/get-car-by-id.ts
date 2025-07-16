import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarByIdData(db: DB, id: string) {
	const [record] = await db.select().from(cars).where(eq(cars.id, id));

	if (!record) {
		throw new Error("Car not found");
	}

	return record;
}
