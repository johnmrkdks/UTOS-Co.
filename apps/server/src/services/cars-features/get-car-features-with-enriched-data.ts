import { getCarFeatures } from "@/data/cars-features/get-car-features";
import { getCarsCountByFeatures } from "@/data/cars/get-cars-count-by-features";
import type { DB } from "@/db";
import type { CarFeatureWithEnrichedData } from "@/types";
import type { QueryListResult, ResourceList } from "@/utils/query/resource-list";

export async function getCarFeaturesWithEnrichedDataService(db: DB, params: ResourceList): Promise<QueryListResult<CarFeatureWithEnrichedData>> {
	const carFeatures = await getCarFeatures(db, params);
	const carsCount = await getCarsCountByFeatures(db);

	const data = carFeatures.data.map(feature => {
		return {
			...feature,
			metadata: {
				carsCount: carsCount.find(car => car.featureId === feature.id)?.count || 0,
			}

		};
	});

	return { data, metadata: carFeatures.metadata };
}
