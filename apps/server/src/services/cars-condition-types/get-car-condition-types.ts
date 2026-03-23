import { getCarConditionTypes } from "@/data/cars-condition-types/get-car-condition-types";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getCarConditionTypesService(
	db: DB,
	params: ResourceList,
) {
	const carConditionTypes = await getCarConditionTypes(db, params);
	return carConditionTypes;
}
