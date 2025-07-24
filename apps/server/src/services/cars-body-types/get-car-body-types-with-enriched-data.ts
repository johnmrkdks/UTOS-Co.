import { getCarBodyTypes } from "@/data/cars-body-types/get-car-body-types";
import { getCarsCountByBodyTypes } from "@/data/cars/get-cars-count-by-body-types";
import { getCarsCountByBrands } from "@/data/cars/get-cars-count-by-brands";
import type { DB } from "@/db";
import type { CarBodyTypeWithEnrichedData } from "@/types";
import type { QueryListResult, ResourceList } from "@/utils/query/resource-list";

export async function getCarBodyTypesWithEnrichedDataService(db: DB, params: ResourceList): Promise<QueryListResult<CarBodyTypeWithEnrichedData>> {
	const carBodyTypes = await getCarBodyTypes(db, params);
	const carsCount = await getCarsCountByBodyTypes(db);

	const data = carBodyTypes.data.map(bodyType => {
		return {
			...bodyType,
			metadata: {
				carsCount: carsCount.find(car => car.bodyTypeId === bodyType.id)?.count || 0,
			}

		};
	});

	return { data, metadata: carBodyTypes.metadata };
}
