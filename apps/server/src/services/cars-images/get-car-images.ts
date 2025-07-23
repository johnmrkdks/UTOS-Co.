import { getCarImages } from "@/data/cars-images/get-car-images";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarImagesService(db: DB, params: ResourceList) {
	const carImages = await getCarImages(db, params);
	return carImages;
}
