import { getCarCategories } from "@/data/cars-categories/get-car-categories";
import { getCarsCountByCategories } from "@/data/cars/get-cars-count-by-categories";
import type { DB } from "@/db";
import type { CarCategoryWithEnrichedData } from "@/types";
import type { QueryListResult, ResourceList } from "@/utils/query/resource-list";

export async function getCarCategoriesWithEnrichedDataService(db: DB, params: ResourceList): Promise<QueryListResult<CarCategoryWithEnrichedData>> {
	const carCategories = await getCarCategories(db, params);
	const carsCount = await getCarsCountByCategories(db);

	const data = carCategories.data.map(category => {
		return {
			...category,
			metadata: {
				carsCount: carsCount.find(car => car.categoryId === category.id)?.count || 0,
			}

		};
	});

	return { data, metadata: carCategories.metadata };
}
