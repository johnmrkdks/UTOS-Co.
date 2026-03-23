import { z } from "zod";
import { getCarsCountByTransmissionTypeId } from "@/data/cars/get-cars-count-by-transmission-type-id";
import { deleteCarTransmissionType } from "@/data/cars-transmission-types/delete-car-transmission-type";
import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export const DeleteCarTransmissionTypeServiceSchema = z.object({
	id: z.string(),
});

export type DeleteCarTransmissionTypeParams = z.infer<
	typeof DeleteCarTransmissionTypeServiceSchema
>;

export async function deleteCarTransmissionTypeService(
	db: DB,
	{ id }: DeleteCarTransmissionTypeParams,
) {
	const carCount = await getCarsCountByTransmissionTypeId(db, id);

	if (carCount > 0) {
		throw ErrorFactory.badRequest(
			"Some entities are using this car transmission type. Please delete them first.",
		);
	}

	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	if (!carTransmissionType) {
		throw ErrorFactory.notFound("Car transmission type not found.");
	}

	const deletedCarTransmissionType = await deleteCarTransmissionType(db, id);
	return deletedCarTransmissionType;
}
