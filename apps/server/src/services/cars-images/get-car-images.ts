import { getCarImages } from "@/data/cars-images/get-car-images";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarImagesService(db: DB, options: ResourceList) {
	const carImages = await getCarImages(db, options);
	return carImages;
}
