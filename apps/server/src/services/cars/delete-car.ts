import { deleteCar } from "@/data/cars/delete-car";
import { getCarById } from "@/data/cars/get-car-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteCarService(db: DB, id: string) {
	const car = await getCarById(db, id);

	if (!car) {
		throw ErrorFactory.notFound("Car not found.");
	}

	const deletedCar = await deleteCar(db, id);
	return deletedCar;
}
