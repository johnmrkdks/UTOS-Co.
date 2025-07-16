import type { DB } from "@/db";
import { cars } from "@/db/schema";
import type { Car } from "@/schemas/tables/car";
import { eq } from "drizzle-orm";

export async function deleteCar(db: DB, id: string): Promise<Car> {
	const [record] = await db.delete(cars).where(eq(cars.id, id)).returning();

	return record;
}
