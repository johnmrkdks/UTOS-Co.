import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { CarImage, InsertCarImage } from "@/schemas/shared/tables/car-image";
import { carImages } from "@/db/schema";

type CreateCarImageParams = InsertCarImage;

export async function createCarImage(db: DB, params: CreateCarImageParams): Promise<CarImage> {
	const [record] = await db.insert(carImages).values(params).returning();

	return record;
}
