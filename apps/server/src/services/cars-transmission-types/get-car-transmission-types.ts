import { getCarTransmissionTypes } from "@/data/cars-transmission-types/get-car-transmission-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarTransmissionTypesService(db: DB, options: ResourceList) {
	const carTransmissionTypes = await getCarTransmissionTypes(db, options);
	return carTransmissionTypes;
}
