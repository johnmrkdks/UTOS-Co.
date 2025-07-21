import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarBrand } from "@/schemas/shared";
import { carBrands } from "@/db/schema";

type UpdateCarBrandParams = {
	id: string;
	data: UpdateCarBrand;
};

export async function updateCarBrand(db: DB, { id, data }: UpdateCarBrandParams) {
	const [updatedCarBrand] = await db.update(carBrands).set(data).where(eq(carBrands.id, id)).returning();
	return updatedCarBrand;
}
