import { getCarsCountByTransmissionTypes } from "@/data/cars/get-cars-count-by-transmission-types";
import { getCarTransmissionTypes } from "@/data/cars-transmission-types/get-car-transmission-types";
import type { DB } from "@/db";
import type { CarTransmissionTypeWithEnrichedData } from "@/types";
import type {
	QueryListResult,
	ResourceList,
} from "@/utils/query/resource-list";

export async function getCarTransmissionTypesWithEnrichedDataService(
	db: DB,
	params: ResourceList,
): Promise<QueryListResult<CarTransmissionTypeWithEnrichedData>> {
	const carTransmissionTypes = await getCarTransmissionTypes(db, params);
	const carsCount = await getCarsCountByTransmissionTypes(db);

	const data = carTransmissionTypes.data.map((transmissionType) => {
		return {
			...transmissionType,
			metadata: {
				carsCount:
					carsCount.find(
						(car) => car.transmissionTypeId === transmissionType.id,
					)?.count || 0,
			},
		};
	});

	return { data, metadata: carTransmissionTypes.metadata };
}
