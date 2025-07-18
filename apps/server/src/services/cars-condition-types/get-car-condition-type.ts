import { getCarConditionType } from "@/data/cars-condition-types/get-car-condition-type";
import type { DB } from "@/db";

export async function getCarConditionTypeService(db: DB, id: string) {
	const carConditionType = await getCarConditionType(db, id);
	return carConditionType;
}
