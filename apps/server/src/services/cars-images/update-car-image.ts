import { updateCarImage } from "@/data/cars-images/update-car-image";
import type { DB } from "@/db";
import type { UpdateCarImage } from "@/schemas/shared";

type UpdateCarImageParams = {
	id: string;
	data: UpdateCarImage;
};

export async function updateCarImageService(db: DB, { id, data }: UpdateCarImageParams) {
	const updatedCarImage = await updateCarImage(db, { id, data });

	return updatedCarImage;
}
