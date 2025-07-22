import { deleteCarImage } from "@/data/cars-images/delete-car-image";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarImageServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarImageService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarImageServiceSchema>,
) {
	const carImage = await deleteCarImage(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	const deletedCarImage = await deleteCarImage(db, id);
	return deletedCarImage;
}
