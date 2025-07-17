import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type {
	CarModel,
	UpdateCarModel,
} from "@/schemas/shared/tables/cars/car-model";
import { eq } from "drizzle-orm";

type UpdateCarModelParams = {
	id: string;
	data: Partial<UpdateCarModel>;
};

export async function updateCarModel(
	db: DB,
	params: UpdateCarModelParams,
): Promise<CarModel> {
	const { id, data } = params;

	const [record] = await db
		.update(carModels)
		.set(data)
		.where(eq(carModels.id, id))
		.returning();

	return record;
}
