import { getCarFeature } from "@/data/cars-features/get-car-feature";
import { updateCarFeature } from "@/data/cars-features/update-car-feature";
import type { DB } from "@/db";
import type { UpdateCarFeature } from "@/schemas/shared";
import { ErrorFactory } from "@/utils/error-factory";
import formatter from "lodash";

type UpdateCarFeatureParams = {
	id: string;
	data: UpdateCarFeature;
};

export async function updateCarFeatureService(db: DB, { id, data }: UpdateCarFeatureParams) {
	const carFeature = await getCarFeature(db, id);

	if (!carFeature) {
		throw ErrorFactory.notFound("Car feature not found.");
	}

	const values = {
		...data,
		feature: data.feature ? formatter.startCase(data.feature) : undefined,
	} as UpdateCarFeature;

	const updatedCarFeature = await updateCarFeature(db, { id, data: values });

	return updatedCarFeature;
}
