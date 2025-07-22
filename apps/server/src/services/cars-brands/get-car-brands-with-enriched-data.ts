import { getCarBrands } from "@/data/cars-brands/get-car-brands";
import { getCarModelsCountByBrands } from "@/data/cars-models/get-car-models-count-by-brand";
import { getCarsCountByBrands } from "@/data/cars/get-cars-count-by-brands";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrandsWithEnrichedDataService(db: DB, options: ResourceList) {
	const carBrands = await getCarBrands(db, options);
	const carModelsCount = await getCarModelsCountByBrands(db);
	const carsCount = await getCarsCountByBrands(db);

	const data = carBrands.data.map(brand => {
		return {
			...brand,
			metadata: {
				modelCount: carModelsCount[brand.id]?.count || 0,
				carsCount: carsCount[brand.id]?.count || 0,
			}

		};
	});

	return { data, metadata: carBrands.metadata };
}
