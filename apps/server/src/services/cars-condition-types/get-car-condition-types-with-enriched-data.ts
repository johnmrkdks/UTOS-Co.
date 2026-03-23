import { getCarsCountByConditionTypes } from "@/data/cars/get-cars-count-by-condition-types";
import { getCarConditionTypes } from "@/data/cars-condition-types/get-car-condition-types";
import type { DB } from "@/db";
import type { CarConditionTypeWithEnrichedData } from "@/types";
import type {
	QueryListResult,
	ResourceList,
} from "@/utils/query/resource-list";

export async function getCarConditionTypesWithEnrichedDataService(
	db: DB,
	params: ResourceList,
): Promise<QueryListResult<CarConditionTypeWithEnrichedData>> {
	const carConditionTypes = await getCarConditionTypes(db, params);
	const carsCount = await getCarsCountByConditionTypes(db);

	const data = carConditionTypes.data.map((conditionType) => {
		return {
			...conditionType,
			metadata: {
				carsCount:
					carsCount.find((car) => car.conditionTypeId === conditionType.id)
						?.count || 0,
			},
		};
	});

	return { data, metadata: carConditionTypes.metadata };
}
