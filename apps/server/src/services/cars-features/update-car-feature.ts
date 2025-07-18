import { updateCarFeature } from "@/data/cars-features/update-car-feature";
import type { DB } from "@/db";
import type { UpdateCarFeature } from "@/schemas/shared/tables/car-feature";
import formatter from "lodash";

export async function updateCarFeatureService(db: DB, id: string, data: UpdateCarFeature) {
	const values = {
		...data,
		name: data.name ? formatter.startCase(data.name) : undefined,
	} as UpdateCarFeature;

	const updatedCarFeature = await updateCarFeature(db, id, values);

	return updatedCarFeature;
}
