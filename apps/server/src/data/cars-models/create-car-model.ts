import type { DB } from "@/db";
import type { CarModel, InsertCarModel } from "@/schemas/shared";
import { carModels } from "@/db/schema";

type CreateCarModelParams = InsertCarModel;

export async function createCarModel(db: DB, params: CreateCarModelParams): Promise<CarModel> {
	const [record] = await db.insert(carModels).values(params).returning();

	return record;
}
