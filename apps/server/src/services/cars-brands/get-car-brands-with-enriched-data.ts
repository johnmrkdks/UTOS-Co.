import { getCarBrands } from "@/data/cars-brands/get-car-brands";
import { getCarModelsCountByBrands } from "@/data/cars-models/get-car-models-count-by-brand";
import { getCarsCountByBrands } from "@/data/cars/get-cars-count-by-brands";
import type { DB } from "@/db";
import type { CarBrandWithEnrichedData } from "@/schemas/shared";
import type { QueryListResult, ResourceList } from "@/utils/query/resource-list";

export async function getCarBrandsWithEnrichedDataService(db: DB, params: ResourceList): Promise<QueryListResult<CarBrandWithEnrichedData>> {
	const carBrands = await getCarBrands(db, params);
	const carModelsCount = await getCarModelsCountByBrands(db);
	const carsCount = await getCarsCountByBrands(db);

	const data = carBrands.data.map(brand => {
		return {
			...brand,
			metadata: {
				modelCount: carModelsCount.find(model => model.brandId === brand.id)?.count || 0,
				carsCount: carsCount.find(car => car.brandId === brand.id)?.count || 0,
			}

		};
	});

	return { data, metadata: carBrands.metadata };
}
