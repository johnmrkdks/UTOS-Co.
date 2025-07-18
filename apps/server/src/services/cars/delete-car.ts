import { deleteCar } from "@/data/cars/delete-car";
import type { DB } from "@/db";

export async function deleteCarService(db: DB, id: string) {
	const deletedCar = await deleteCar(db, id);
	return deletedCar;
}
