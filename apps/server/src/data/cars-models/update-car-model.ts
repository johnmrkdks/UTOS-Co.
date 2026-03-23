import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type { UpdateCarModel } from "@/schemas/shared";

type UpdateCarModelParams = {
	id: string;
	data: UpdateCarModel;
};

export async function updateCarModel(
	db: DB,
	{ id, data }: UpdateCarModelParams,
) {
	const [updatedCarModel] = await db
		.update(carModels)
		.set(data)
		.where(eq(carModels.id, id))
		.returning();
	return updatedCarModel;
}
