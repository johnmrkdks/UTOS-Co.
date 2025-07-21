import { createCarImage } from "@/data/cars-images/create-car-image";
import type { DB } from "@/db";
import type { CarImage, InsertCarImage } from "@/schemas/shared";

export async function createCarImageService(db: DB, data: InsertCarImage): Promise<CarImage> {
	const newCarImage = createCarImage(db, data);

	return newCarImage;
}
