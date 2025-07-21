import { createCarTransmissionType } from "@/data/cars-transmission-types/create-car-transmission-type";
import type { DB } from "@/db";
import type { CarTransmissionType, InsertCarTransmissionType } from "@/schemas/shared";
import formatter from "lodash";

export async function createCarTransmissionTypeService(db: DB, data: InsertCarTransmissionType): Promise<CarTransmissionType> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarTransmissionType;

	const newCarTransmissionType = createCarTransmissionType(db, values);

	return newCarTransmissionType;
}
