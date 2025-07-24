import type { DB } from "@/db";
import { getCarModelsByBrandId } from "@/data/cars-models/get-car-models-by-brand-id";
import { getCarsByBrandId } from "@/data//cars/get-cars-by-brand-id";

export async function checkCarBrandUsage(db: DB, brandId: string) {
	const { data: cars } = await getCarsByBrandId(db, { brandId })
	const { data: carModels } = await getCarModelsByBrandId(db, { brandId })

	return {
		isInUse: cars.length > 0 || carModels.length > 0,
		carCount: cars.length,
		carModelsCount: carModels.length,
		totalUsages: cars.length + carModels.length,
		cars,
		carModels,
	};
}
