import { getCarCategories } from "@/data/cars-categories/get-car-categories";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarCategoriesService(db: DB, params: ResourceList) {
	const carCategories = await getCarCategories(db, params);
	return carCategories;
}
