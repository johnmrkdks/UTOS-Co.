import { deleteCarModel } from "@/data/cars-models/delete-car-model";
import type { DB } from "@/db";

export async function deleteCarModelService(db: DB, id: string) {
	const deletedCarModel = await deleteCarModel(db, id);
	return deletedCarModel;
}
