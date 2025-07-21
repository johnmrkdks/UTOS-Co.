import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarModel } from "@/schemas/shared";
import { carModels } from "@/db/schema";

export async function updateCarModel(db: DB, id: string, data: UpdateCarModel) {
	const [updatedCarModel] = await db.update(carModels).set(data).where(eq(carModels.id, id)).returning();
	return updatedCarModel;
}
