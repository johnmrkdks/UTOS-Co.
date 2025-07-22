import { createCarTransmissionType } from "@/data/cars-transmission-types/create-car-transmission-type";
import { getCarTransmissionTypeByName } from "@/data/cars-transmission-types/get-car-transmission-type-by-name";
import type { DB } from "@/db";
import type { CarTransmissionType, InsertCarTransmissionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarTransmissionTypeService(db: DB, data: InsertCarTransmissionType): Promise<CarTransmissionType> {
	const checkTransmissionTypeExists = await getCarTransmissionTypeByName(db, data.name);

	if (checkTransmissionTypeExists) {
		throw ErrorFactory.duplicateEntry('Car transmission type', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarTransmissionType;

	const newCarTransmissionType = createCarTransmissionType(db, values);

	return newCarTransmissionType;
}
