import type { DB } from "@/db";
import { carFuelTypes } from "@/db/schema";
import type { UpdateCarFeature } from "@/schemas/shared/tables/cars/car-feature";
import type { CarFuelType } from "@/schemas/shared/tables/cars/car-fuel-type";
import { eq } from "drizzle-orm";

type UpdateCarFuelTypeParams = {
	id: string;
	data: Partial<UpdateCarFeature>;
};

export async function updateCarFeature(
	db: DB,
	params: UpdateCarFuelTypeParams,
): Promise<CarFuelType> {
	const { id, data } = params;

	const [record] = await db
		.update(carFuelTypes)
		.set(data)
		.where(eq(carFuelTypes.id, id))
		.returning();

	return record;
}
