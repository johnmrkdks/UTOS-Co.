import { getCarById } from "@/data/cars/get-car-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarServiceSchema = z.object({
	id: z.string()
});

export async function getCarService(db: DB, { id }: z.infer<typeof GetCarServiceSchema>) {
	const car = await getCarById(db, id);

	if (!car) {
		throw ErrorFactory.notFound("Car not found.");
	}

	return car;
}
