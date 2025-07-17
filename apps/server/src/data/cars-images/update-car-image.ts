import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type {
	CarImage,
	UpdateCarImage,
} from "@/schemas/shared/tables/cars/car-image";
import { eq } from "drizzle-orm";

type UpdateCarImageParams = {
	id: string;
	data: Partial<UpdateCarImage>;
};

export async function updateCarImage(
	db: DB,
	params: UpdateCarImageParams,
): Promise<CarImage> {
	const { id, data } = params;

	const [record] = await db
		.update(carImages)
		.set(data)
		.where(eq(carImages.id, id))
		.returning();

	return record;
}
