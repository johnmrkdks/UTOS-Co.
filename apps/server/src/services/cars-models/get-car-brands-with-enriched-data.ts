import { getCarModels } from "@/data/cars-models/get-car-models";
import { getCarsCountByModels } from "@/data/cars/get-cars-count-by-models";
import type { DB } from "@/db";
import type { CarModelWithEnrichedData } from "@/schemas/shared";
import type { QueryListResult, ResourceList } from "@/utils/query/resource-list";

export async function getCarModelsWithEnrichedDataService(db: DB, params: ResourceList): Promise<QueryListResult<CarModelWithEnrichedData>> {
	const carModels = await getCarModels(db, params);
	const carsCount = await getCarsCountByModels(db);

	const data = carModels.data.map(model => {
		return {
			...model,
			metadata: {
				carsCount: carsCount.find(car => car.modelId === model.id)?.count || 0,
			}

		};
	});

	return { data, metadata: carModels.metadata };
}
