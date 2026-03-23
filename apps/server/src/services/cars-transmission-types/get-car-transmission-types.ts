import { getCarTransmissionTypes } from "@/data/cars-transmission-types/get-car-transmission-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarTransmissionTypesService(
	db: DB,
	params: ResourceList,
) {
	const carTransmissionTypes = await getCarTransmissionTypes(db, params);
	return carTransmissionTypes;
}
