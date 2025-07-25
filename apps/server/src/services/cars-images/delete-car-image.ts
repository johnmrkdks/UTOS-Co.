import { deleteCarImage } from "@/data/cars-images/delete-car-image";
import { getCarImageById } from "@/data/cars-images/get-car-image-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarImageServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarImageParams = z.infer<typeof DeleteCarImageServiceSchema>;

export async function deleteCarImageService(
	db: DB,
	{ id }: DeleteCarImageParams,
) {
	const carImage = await getCarImageById(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	const deletedCarImage = await deleteCarImage(db, id);
	return deletedCarImage;
}
