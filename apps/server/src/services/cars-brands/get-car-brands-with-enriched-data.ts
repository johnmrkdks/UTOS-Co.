import { getCarBrands } from "@/data/cars-brands/get-car-brands";
import { getCarBrandsWithModels } from "@/data/cars-brands/get-car-brands-with-models";
import { getCarModelsCountByBrands } from "@/data/cars-models/get-car-models-count-by-brand";
import { getCarsCountByBrands } from "@/data/cars/get-cars-count-by-brands";
import { getCarsCountByModels } from "@/data/cars/get-cars-count-by-models";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarBrandsWithEnrichedDataService(db: DB, options: ResourceList) {
	const carBrands = await getCarBrands(db, options);
	const carModelsCount = await getCarModelsCountByBrands(db);
	const carsCount = await getCarsCountByBrands(db);

	console.log("carBrands", carBrands)
	console.log("carModelsCount", carModelsCount)
	console.log("carsCount", carsCount)

	const data = carBrands.data.map(brand => {
		return {
			...brand,
			metadata: {
				modelCount: carModelsCount[brand.id]?.count || 0,
				carsCount: carsCount[brand.id]?.count || 0,
			}

		};
	});

	console.log("data", data)

	return { data, metadata: carBrands.metadata };
}
