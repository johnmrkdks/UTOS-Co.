import { getCarFuelTypeById } from "@/data/cars-fuel-types/get-car-fuel-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const GetCarFuelTypeServiceSchema = z.object({
	id: z.string(),
});

export type GetCarFuelTypeByIdParams = z.infer<typeof GetCarFuelTypeServiceSchema>;

export async function getCarFuelTypeService(
	db: DB,
	{ id }: GetCarFuelTypeByIdParams,
) {
	const carFuelType = await getCarFuelTypeById(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	return carFuelType;
}
