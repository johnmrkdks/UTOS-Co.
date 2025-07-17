import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { CarImage } from "@/schemas/shared/tables/cars/car-image";
import { eq } from "drizzle-orm";

export async function deleteCarImage(db: DB, id: string): Promise<CarImage> {
	const [record] = await db
		.delete(carImages)
		.where(eq(carImages.id, id))
		.returning();

	return record;
}
