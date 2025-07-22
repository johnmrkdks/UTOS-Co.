import { getCarImageById } from "@/data/cars-images/get-car-image-by-id";
import { updateCarImage } from "@/data/cars-images/update-car-image";
import type { DB } from "@/db";
import type { UpdateCarImage } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";

type UpdateCarImageParams = {
	id: string;
	data: UpdateCarImage;
};

export async function updateCarImageService(db: DB, { id, data }: UpdateCarImageParams) {
	const carImage = await getCarImageById(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	const updatedCarImage = await updateCarImage(db, { id, data });

	return updatedCarImage;
}
