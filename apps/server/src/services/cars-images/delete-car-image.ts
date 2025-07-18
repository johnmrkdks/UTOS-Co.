import { deleteCarImage } from "@/data/cars-images/delete-car-image";
import type { DB } from "@/db";

export async function deleteCarImageService(db: DB, id: string) {
	const deletedCarImage = await deleteCarImage(db, id);
	return deletedCarImage;
}
