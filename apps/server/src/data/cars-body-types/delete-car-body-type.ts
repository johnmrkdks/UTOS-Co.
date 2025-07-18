import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteCarBodyType(db: DB, id: string) {
	const [deletedCarBodyType] = await db.delete(carBodyTypes).where(eq(carBodyTypes.id, id)).returning();
	return deletedCarBodyType;
}
