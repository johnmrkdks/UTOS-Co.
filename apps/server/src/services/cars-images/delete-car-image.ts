import { deleteCarImage } from "@/data/cars-images/delete-car-image";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteCarImageService(db: DB, id: string) {
	const carImage = await deleteCarImage(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	const deletedCarImage = await deleteCarImage(db, id);
	return deletedCarImage;
}
