import { getCarModel } from "@/data/cars-models/get-car-model";
import type { DB } from "@/db";

export async function getCarModelService(db: DB, id: string) {
	const carModel = await getCarModel(db, id);
	return carModel;
}
