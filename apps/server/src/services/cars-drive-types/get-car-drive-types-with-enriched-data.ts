import { getCarsCountByDriveTypes } from "@/data/cars/get-cars-count-by-drive-types";
import { getCarDriveTypes } from "@/data/cars-drive-types/get-car-drive-types";
import type { DB } from "@/db";
import type { CarDriveTypeWithEnrichedData } from "@/types";
import type {
	QueryListResult,
	ResourceList,
} from "@/utils/query/resource-list";

export async function getCarDriveTypesWithEnrichedDataService(
	db: DB,
	params: ResourceList,
): Promise<QueryListResult<CarDriveTypeWithEnrichedData>> {
	const carDriveTypes = await getCarDriveTypes(db, params);
	const carsCount = await getCarsCountByDriveTypes(db);

	const data = carDriveTypes.data.map((driveType) => {
		return {
			...driveType,
			metadata: {
				carsCount:
					carsCount.find((car) => car.driveTypeId === driveType.id)?.count || 0,
			},
		};
	});

	return { data, metadata: carDriveTypes.metadata };
}
