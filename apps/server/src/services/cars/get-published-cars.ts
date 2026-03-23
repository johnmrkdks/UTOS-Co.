import { getPublishedCars } from "@/data/cars/get-published-cars";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

// Transform car data to include flattened properties for frontend
function transformCarForFrontend(car: any) {
	return {
		...car,
		// Flatten brand and model data
		brandName: car.model?.brand?.name || "",
		modelName: car.model?.name || "",
		categoryName: car.category?.name || "",
		// Get the first available image URL
		imageUrl: car.images?.[0]?.url || null,
		// Transform features to a simple array
		features: car.carsToFeatures?.map((ctf: any) => ({
			id: ctf.feature?.id,
			name: ctf.feature?.name,
		})) || [],
		// Engine type from fuel type
		engineType: car.fuelType?.name || "",
	};
}

export async function getPublishedCarsService(db: DB, params: ResourceList) {
	const carsResult = await getPublishedCars(db, params);
	
	// Transform the cars data if it exists
	if (carsResult.data) {
		const transformedCars = carsResult.data.map(transformCarForFrontend);
		return {
			...carsResult,
			data: transformedCars,
		};
	}
	
	return carsResult;
}