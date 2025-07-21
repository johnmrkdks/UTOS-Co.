import { updateCarFeature } from "@/data/cars-features/update-car-feature";
import type { DB } from "@/db";
import type { UpdateCarFeature } from "@/schemas/shared";
import formatter from "lodash";

type UpdateCarFeatureParams = {
	id: string;
	data: UpdateCarFeature;
};

export async function updateCarFeatureService(db: DB, { id, data }: UpdateCarFeatureParams) {
	const values = {
		...data,
		feature: data.feature ? formatter.startCase(data.feature) : undefined,
	} as UpdateCarFeature;

	const updatedCarFeature = await updateCarFeature(db, { id, data: values });

	return updatedCarFeature;
}
