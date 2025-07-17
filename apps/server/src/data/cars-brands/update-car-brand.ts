import type { DB } from "@/db";
import { carBrands } from "@/db/schema";
import type {
	CarBrand,
	UpdateCarBrand,
} from "@/schemas/shared/tables/cars/car-brand";
import { eq } from "drizzle-orm";

type UpdateCarBrandParams = {
	id: string;
	data: Partial<UpdateCarBrand>;
};

export async function updateCarBrand(
	db: DB,
	params: UpdateCarBrandParams,
): Promise<CarBrand> {
	const { id, data } = params;

	const [record] = await db
		.update(carBrands)
		.set(data)
		.where(eq(carBrands.id, id))
		.returning();

	return record;
}
