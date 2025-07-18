import { getCars } from "@/data/cars/get-cars";
import type { DB } from "@/db";
import type { ResourceList } from "@/types/resource-list";

export async function getCarsService(db: DB, options: ResourceList) {
	const cars = await getCars(db, options);
	return cars;
}
