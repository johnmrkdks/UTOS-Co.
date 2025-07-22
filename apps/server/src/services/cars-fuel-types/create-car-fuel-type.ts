import { createCarFuelType } from "@/data/cars-fuel-types/create-car-fuel-type";
import { getCarFuelTypeByName } from "@/data/cars-fuel-types/get-car-fuel-type-by-name";
import type { DB } from "@/db";
import type { CarFuelType, InsertCarFuelType } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

export async function createCarFuelTypeService(db: DB, data: InsertCarFuelType): Promise<CarFuelType> {
	const carFuelTypeName = await getCarFuelTypeByName(db, data.name);

	if (carFuelTypeName) {
		throw ErrorFactory.duplicateEntry('Car fuel type', "name");
	}

	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarFuelType;

	const newCarFuelType = createCarFuelType(db, values);

	return newCarFuelType;
}
