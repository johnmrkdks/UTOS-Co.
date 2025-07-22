import { deleteCarConditionType } from "@/data/cars-condition-types/delete-car-condition-type";
import { getCarConditionType } from "@/data/cars-condition-types/get-car-condition-type";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";

export async function deleteCarConditionTypeService(db: DB, id: string) {
	const carConditionType = await getCarConditionType(db, id);

	if (!carConditionType) {
		throw ErrorFactory.notFound("Car condition type not found.");
	}

	const deletedCarConditionType = await deleteCarConditionType(db, id);
	return deletedCarConditionType;
}
