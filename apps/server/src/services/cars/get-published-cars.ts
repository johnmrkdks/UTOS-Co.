import { getPublishedCars } from "@/data/cars/get-published-cars";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPublishedCarsService(db: DB, params: ResourceList) {
	const cars = await getPublishedCars(db, params);
	return cars;
}