import { getCarModel } from "@/data/cars-models/get-car-model";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getCarModelService(db: DB, id: string) {
	const carModel = await getCarModel(db, id);

	if (!carModel) {
		throw ErrorFactory.notFound("Car model not found.");
	}

	return carModel;
}
