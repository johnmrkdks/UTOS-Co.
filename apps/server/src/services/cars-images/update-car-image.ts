import { getCarImageById } from "@/data/cars-images/get-car-image-by-id";
import { updateCarImage } from "@/data/cars-images/update-car-image";
import type { DB } from "@/db";
import { UpdateCarImageSchema } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const UpdateCarImageServiceSchema = z.object({
	id: z.string(),
	data: UpdateCarImageSchema,
});

export async function updateCarImageService(
	db: DB,
	{ id, data }: z.infer<typeof UpdateCarImageServiceSchema>,
) {
	const carImage = await getCarImageById(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	const updatedCarImage = await updateCarImage(db, { id, data });

	return updatedCarImage;
}
