import { deleteCarFuelType } from "@/data/cars-fuel-types/delete-car-fuel-type";
import type { DB } from "@/db";

export async function deleteCarFuelTypeService(db: DB, id: string) {
	const deletedCarFuelType = await deleteCarFuelType(db, id);
	return deletedCarFuelType;
}
