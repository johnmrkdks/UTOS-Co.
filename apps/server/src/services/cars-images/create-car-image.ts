import { createCarImage } from "@/data/cars-images/create-car-image";
import type { DB } from "@/db";
import { InsertCarImageSchema } from "@/schemas/shared";
import { z } from "zod";

export const CreateCarImageServiceSchema = InsertCarImageSchema;

export async function createCarImageService(
	db: DB,
	data: z.infer<typeof CreateCarImageServiceSchema>,
) {
	const newCarImage = createCarImage(db, data);

	return newCarImage;
}
