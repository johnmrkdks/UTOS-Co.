import { getCarBodyTypes } from "@/data/cars-body-types/get-car-body-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarBodyTypesService(db: DB, options: ResourceList) {
	const carBodyTypes = await getCarBodyTypes(db, options);
	return carBodyTypes;
}
