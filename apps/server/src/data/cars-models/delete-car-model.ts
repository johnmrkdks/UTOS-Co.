import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carModels } from "@/db/schema";

export async function deleteCarModel(db: DB, id: string) {
	const [deletedCarModel] = await db
		.delete(carModels)
		.where(eq(carModels.id, id))
		.returning();
	return deletedCarModel;
}
