import { deleteCarFuelType } from "@/data/cars-fuel-types/delete-car-fuel-type";
import { getCarFuelTypeById } from "@/data/cars-fuel-types/get-car-fuel-type-by-id";
import { getCarsCountByFuelTypeId } from "@/data/cars/get-cars-count-by-fuel-type-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { z } from "zod";

export const DeleteCarFuelTypeServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarFuelTypeParams = z.infer<typeof DeleteCarFuelTypeServiceSchema>;

export async function deleteCarFuelTypeService(
	db: DB,
	{ id }: DeleteCarFuelTypeParams,
) {
	const carCount = await getCarsCountByFuelTypeId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest("Some entities are using this car fuel type. Please delete them first.");
	}

	const carFuelType = await getCarFuelTypeById(db, id);

	if (!carFuelType) {
		throw ErrorFactory.notFound("Car fuel type not found.");
	}

	const deletedCarFuelType = await deleteCarFuelType(db, id);

	return deletedCarFuelType;
}
