import { deleteCarTransmissionType } from "@/data/cars-transmission-types/delete-car-transmission-type";
import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteCarTransmissionTypeService(db: DB, id: string) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	if (!carTransmissionType) {
		throw ErrorFactory.notFound("Car transmission type not found.");
	}

	const deletedCarTransmissionType = await deleteCarTransmissionType(db, id);
	return deletedCarTransmissionType;
}
