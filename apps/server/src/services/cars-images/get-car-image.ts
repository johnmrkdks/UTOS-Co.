import { z } from "zod";
import { getCarImageById } from "@/data/cars-images/get-car-image-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarImageServiceSchema = z.object({
	id: z.string(),
});

export type GetCarImageByIdParams = z.infer<typeof GetCarImageServiceSchema>;

export async function getCarImageService(
	db: DB,
	{ id }: GetCarImageByIdParams,
) {
	const carImage = await getCarImageById(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	return carImage;
}
