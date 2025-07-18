import { deleteCarBodyType } from "@/data/cars-body-types/delete-car-body-type";
import type { DB } from "@/db";

export async function deleteCarBodyTypeService(db: DB, id: string) {
	const deletedCarBodyType = await deleteCarBodyType(db, id);
	return deletedCarBodyType;
}
