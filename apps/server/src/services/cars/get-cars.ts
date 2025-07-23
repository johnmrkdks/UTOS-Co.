import { getCars } from "@/data/cars/get-cars";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarsService(db: DB, params: ResourceList) {
	const cars = await getCars(db, params);
	return cars;
}
