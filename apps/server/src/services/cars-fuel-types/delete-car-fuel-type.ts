import { deleteCarFuelType } from "@/data/cars-fuel-types/delete-car-fuel-type";
import { getCarFuelTypeById } from "@/data/cars-fuel-types/get-car-fuel-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarFuelTypeServiceSchema = z.object({
	id: z.string(),
});

export async function deleteCarFuelTypeService(
	db: DB,
	{ id }: z.infer<typeof DeleteCarFuelTypeServiceSchema>,
) {
	const carFuelType = await getCarFuelTypeById(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	const deletedCarFuelType = await deleteCarFuelType(db, id);

	return deletedCarFuelType;
}
