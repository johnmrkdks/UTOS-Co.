import { getCarFuelTypes } from "@/data/cars-fuel-types/get-car-fuel-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarFuelTypesService(db: DB, options: ResourceList) {
	const carFuelTypes = await getCarFuelTypes(db, options);
	return carFuelTypes;
}
