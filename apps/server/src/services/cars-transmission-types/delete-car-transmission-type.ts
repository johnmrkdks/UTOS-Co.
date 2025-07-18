import { deleteCarTransmissionType } from "@/data/cars-transmission-types/delete-car-transmission-type";
import type { DB } from "@/db";

export async function deleteCarTransmissionTypeService(db: DB, id: string) {
	const deletedCarTransmissionType = await deleteCarTransmissionType(db, id);
	return deletedCarTransmissionType;
}
