import { getCarConditionTypes } from "@/data/cars-condition-types/get-car-condition-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/resource-list-schema";

export async function getCarConditionTypesService(db: DB, options: ResourceList) {
	const carConditionTypes = await getCarConditionTypes(db, options);
	return carConditionTypes;
}
