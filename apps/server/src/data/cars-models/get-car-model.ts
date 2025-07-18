import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarModel(db: DB, id: string) {
	const [carModel] = await db.select().from(carModels).where(eq(carModels.id, id));
	return carModel;
}
