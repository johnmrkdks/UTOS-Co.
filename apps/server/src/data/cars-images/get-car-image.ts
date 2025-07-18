import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarImage(db: DB, id: string) {
	const [carImage] = await db.select().from(carImages).where(eq(carImages.id, id));
	return carImage;
}
