import { createCarBodyType } from "@/data/cars-body-types/create-car-body-type";
import { getCarBodyTypeByName } from "@/data/cars-body-types/get-car-body-type-by-name";
import type { DB } from "@/db";
import type { CarBodyType, InsertCarBodyType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarBodyTypeService(db: DB, data: InsertCarBodyType): Promise<CarBodyType> {
	const checkBodyTypeExists = await getCarBodyTypeByName(db, data.name);

	if (checkBodyTypeExists) {
		throw ErrorFactory.duplicateEntry('Car body type', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarBodyType;

	const newCarBodyType = createCarBodyType(db, values);

	return newCarBodyType;
}
