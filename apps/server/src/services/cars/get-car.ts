import { getCarById } from "@/data/cars/get-car-by-id";
import type { DB } from "@/db";

export async function getCarService(db: DB, id: string) {
	const car = await getCarById(db, id);
	return car;
}
