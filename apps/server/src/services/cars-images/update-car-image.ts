import { updateCarImage } from "@/data/cars-images/update-car-image";
import type { DB } from "@/db";
import type { UpdateCarImage } from "@/schemas/shared/tables/car-image";

export async function updateCarImageService(db: DB, id: string, data: UpdateCarImage) {
	const updatedCarImage = await updateCarImage(db, id, data);

	return updatedCarImage;
}
