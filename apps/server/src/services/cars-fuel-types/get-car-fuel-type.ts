import { getCarFuelType } from "@/data/cars-fuel-types/get-car-fuel-type";
import type { DB } from "@/db";

export async function getCarFuelTypeService(db: DB, id: string) {
	const carFuelType = await getCarFuelType(db, id);
	return carFuelType;
}
