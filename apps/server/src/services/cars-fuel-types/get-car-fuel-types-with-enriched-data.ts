import { getCarsCountByFuelTypes } from "@/data/cars/get-cars-count-by-fuel-types";
import { getCarFuelTypes } from "@/data/cars-fuel-types/get-car-fuel-types";
import type { DB } from "@/db";
import type { CarFuelTypeWithEnrichedData } from "@/types";
import type {
	QueryListResult,
	ResourceList,
} from "@/utils/query/resource-list";

export async function getCarFuelTypesWithEnrichedDataService(
	db: DB,
	params: ResourceList,
): Promise<QueryListResult<CarFuelTypeWithEnrichedData>> {
	const carFuelTypes = await getCarFuelTypes(db, params);
	const carsCount = await getCarsCountByFuelTypes(db);

	const data = carFuelTypes.data.map((fuelType) => {
		return {
			...fuelType,
			metadata: {
				carsCount:
					carsCount.find((car) => car.fuelTypeId === fuelType.id)?.count || 0,
			},
		};
	});

	return { data, metadata: carFuelTypes.metadata };
}
