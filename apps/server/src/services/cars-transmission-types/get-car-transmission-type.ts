import { getCarTransmissionType } from "@/data/cars-transmission-types/get-car-transmission-type";
import type { DB } from "@/db";

export async function getCarTransmissionTypeService(db: DB, id: string) {
	const carTransmissionType = await getCarTransmissionType(db, id);
	return carTransmissionType;
}
