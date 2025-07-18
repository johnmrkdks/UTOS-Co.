import { updateCarTransmissionType } from "@/data/cars-transmission-types/update-car-transmission-type";
import type { DB } from "@/db";
import type { UpdateCarTransmissionType } from "@/schemas/shared/tables/car-transmission-type";
import formatter from "lodash";

export async function updateCarTransmissionTypeService(db: DB, id: string, data: UpdateCarTransmissionType) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarTransmissionType;

	const updatedCarTransmissionType = await updateCarTransmissionType(db, id, values);

	return updatedCarTransmissionType;
}
