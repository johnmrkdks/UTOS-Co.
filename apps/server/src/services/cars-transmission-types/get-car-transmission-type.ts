import { getCarTransmissionTypeById } from "@/data/cars-transmission-types/get-car-transmission-type-by-id";
import type { DB } from "@/db";

export async function getCarTransmissionTypeService(db: DB, id: string) {
	const carTransmissionType = await getCarTransmissionTypeById(db, id);

	return carTransmissionType;
}
