import { getCarImage } from "@/data/cars-images/get-car-image";
import type { DB } from "@/db";

export async function getCarImageService(db: DB, id: string) {
	const carImage = await getCarImage(db, id);
	return carImage;
}
