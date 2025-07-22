import { getCarFuelType } from "@/data/cars-fuel-types/get-car-fuel-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function getCarFuelTypeService(db: DB, id: string) {
	const carFuelType = await getCarFuelType(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	return carFuelType;
}
