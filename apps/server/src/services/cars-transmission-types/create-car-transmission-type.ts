import { createCarTransmissionType } from "@/data/cars-transmission-types/create-car-transmission-type";
import { getCarTransmissionTypeByName } from "@/data/cars-transmission-types/get-car-transmission-type-by-name";
import type { DB } from "@/db";
import { InsertCarTransmissionTypeSchema, type InsertCarTransmissionType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";
import { z } from "zod";

export const CreateCarTransmissionTypeServiceSchema = z.object({
	data: InsertCarTransmissionTypeSchema,
});

export async function createCarTransmissionTypeService(db: DB, { data }: z.infer<typeof CreateCarTransmissionTypeServiceSchema>) {
	const carTransmissionTypeName = await getCarTransmissionTypeByName(db, data.name);

	if (carTransmissionTypeName) {
		throw ErrorFactory.duplicateEntry('Car transmission type', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarTransmissionType;

	const newCarTransmissionType = createCarTransmissionType(db, values);

	return newCarTransmissionType;
}
