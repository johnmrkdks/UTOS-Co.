import { z } from "zod";
import { createCarImage } from "@/data/cars-images/create-car-image";
import type { DB } from "@/db";
import { InsertCarImageSchema } from "@/schemas/shared";

export const CreateCarImageServiceSchema = InsertCarImageSchema.extend({
	carId: z.string().min(1, "Car ID is required"),
});

export type CreateCarImageParams = z.infer<typeof CreateCarImageServiceSchema>;

export async function createCarImageService(
	db: DB,
	data: CreateCarImageParams,
) {
	const newCarImage = createCarImage(db, data);

	return newCarImage;
}
