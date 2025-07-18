import { getCarBodyType } from "@/data/cars-body-types/get-car-body-type";
import type { DB } from "@/db";

export async function getCarBodyTypeService(db: DB, id: string) {
	const carBodyType = await getCarBodyType(db, id);
	return carBodyType;
}
