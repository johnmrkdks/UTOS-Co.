import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carImages } from "@/db/schema";

export async function deleteCarImage(db: DB, id: string) {
	const [deletedCarImage] = await db
		.delete(carImages)
		.where(eq(carImages.id, id))
		.returning();
	return deletedCarImage;
}
