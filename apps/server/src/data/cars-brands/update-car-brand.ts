import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type { UpdateCarBrand } from "@/schemas/shared";

type UpdateCarBrandParams = {
	id: string;
	data: UpdateCarBrand;
};

export async function updateCarBrand(
	db: DB,
	{ id, data }: UpdateCarBrandParams,
) {
	const [updatedCarBrand] = await db
		.update(carBrands)
		.set(data)
		.where(eq(carBrands.id, id))
		.returning();
	return updatedCarBrand;
}
