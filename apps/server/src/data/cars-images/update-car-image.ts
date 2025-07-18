import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateCarImage } from "@/schemas/shared/tables/car-image";
import { carImages } from "@/db/schema";

export async function updateCarImage(db: DB, id: string, data: UpdateCarImage) {
	const [updatedCarImage] = await db.update(carImages).set(data).where(eq(carImages.id, id)).returning();
	return updatedCarImage;
}
