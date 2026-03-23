import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carImages } from "@/db/schema";
import type { UpdateCarImage } from "@/schemas/shared";

type UpdateCarImageParams = {
	id: string;
	data: UpdateCarImage;
};

export async function updateCarImage(
	db: DB,
	{ id, data }: UpdateCarImageParams,
) {
	const [updatedCarImage] = await db
		.update(carImages)
		.set(data)
		.where(eq(carImages.id, id))
		.returning();
	return updatedCarImage;
}
