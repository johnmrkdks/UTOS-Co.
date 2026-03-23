import { z } from "zod";
import { getCarById } from "@/data/cars/get-car-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const GetCarServiceSchema = z.object({
	id: z.string(),
});

export type GetCarByIdParams = z.infer<typeof GetCarServiceSchema>;

export async function getCarService(db: DB, { id }: GetCarByIdParams) {
	const car = await getCarById(db, id);

	if (!car) {
		throw ErrorFactory.notFound("Car not found.");
	}

	return car;
}
