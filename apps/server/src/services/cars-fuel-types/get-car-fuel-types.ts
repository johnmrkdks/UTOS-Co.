import { getCarFuelTypes } from "@/data/cars-fuel-types/get-car-fuel-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarFuelTypesService(db: DB, options: ResourceList) {
	const carFuelTypes = await getCarFuelTypes(db, options);
	return carFuelTypes;
}
