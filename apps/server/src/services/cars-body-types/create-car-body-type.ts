import { createCarBodyType } from "@/data/cars-body-types/create-car-body-type";
import type { DB } from "@/db";
import type { CarBodyType, InsertCarBodyType } from "@/schemas/shared/tables/car-body-type";
import formatter from "lodash";

export async function createCarBodyTypeService(db: DB, data: InsertCarBodyType): Promise<CarBodyType> {
	const values = {
		...data,
		name: formatter.startCase(data.name),
	} as InsertCarBodyType;

	const newCarBodyType = createCarBodyType(db, values);

	return newCarBodyType;
}
