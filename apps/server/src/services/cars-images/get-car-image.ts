import { getCarImageById } from "@/data/cars-images/get-car-image-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarImageServiceSchema = z.object({
	id: z.string(),
});

export async function getCarImageService(db: DB, { id }: z.infer<typeof GetCarImageServiceSchema>) {
	const carImage = await getCarImageById(db, id);

	if (!carImage) {
		throw ErrorFactory.notFound("Car image not found.");
	}

	return carImage;
}
