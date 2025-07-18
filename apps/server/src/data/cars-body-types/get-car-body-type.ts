import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarBodyType(db: DB, id: string) {
	const [carBodyType] = await db.select().from(carBodyTypes).where(eq(carBodyTypes.id, id));
	return carBodyType;
}
