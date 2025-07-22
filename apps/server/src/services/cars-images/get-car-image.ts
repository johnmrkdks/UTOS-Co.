import { getCarImage } from "@/data/cars-images/get-car-image";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getCarImageService(db: DB, id: string) {
	const carImage = await getCarImage(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	return carImage;
}
