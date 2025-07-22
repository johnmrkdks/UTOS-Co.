import { getCarFuelType } from "@/data/cars-fuel-types/get-car-fuel-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarFuelTypeServiceSchema = z.object({
	id: z.string(),
});

export async function getCarFuelTypeService(
	db: DB,
	{ id }: z.infer<typeof GetCarFuelTypeServiceSchema>,
) {
	const carFuelType = await getCarFuelType(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	return carFuelType;
}
