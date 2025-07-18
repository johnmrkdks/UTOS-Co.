import { createCarFuelType } from "@/data/cars-fuel-types/create-car-fuel-type";
import type { DB } from "@/db";
import type { CarFuelType, InsertCarFuelType } from "@/schemas/shared/tables/car-fuel-type";
import formatter from "lodash";

export async function createCarFuelTypeService(db: DB, data: InsertCarFuelType): Promise<CarFuelType> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarFuelType;

	const newCarFuelType = createCarFuelType(db, values);

	return newCarFuelType;
}
