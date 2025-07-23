import { getCarFuelTypes } from "@/data/cars-fuel-types/get-car-fuel-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarFuelTypesService(db: DB, params: ResourceList) {
	const carFuelTypes = await getCarFuelTypes(db, params);
	return carFuelTypes;
}
