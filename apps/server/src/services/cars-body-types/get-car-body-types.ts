import { getCarBodyTypes } from "@/data/cars-body-types/get-car-body-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarBodyTypesService(db: DB, params: ResourceList) {
	const carBodyTypes = await getCarBodyTypes(db, params);
	return carBodyTypes;
}
