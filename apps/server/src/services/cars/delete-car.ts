import { deleteCar } from "@/data/cars/delete-car";
import { getCarById } from "@/data/cars/get-car-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarServiceSchema = z.object({
	id: z.string()
});

export async function deleteCarService(db: DB, { id }: z.infer<typeof DeleteCarServiceSchema>) {
	const car = await getCarById(db, id);

	if (!car) {
		throw ErrorFactory.notFound("Car not found.");
	}

	const deletedCar = await deleteCar(db, id);
	return deletedCar;
}
