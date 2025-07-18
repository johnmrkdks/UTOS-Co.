import { deleteCarConditionType } from "@/data/cars-condition-types/delete-car-condition-type";
import type { DB } from "@/db";

export async function deleteCarConditionTypeService(db: DB, id: string) {
	const deletedCarConditionType = await deleteCarConditionType(db, id);
	return deletedCarConditionType;
}
