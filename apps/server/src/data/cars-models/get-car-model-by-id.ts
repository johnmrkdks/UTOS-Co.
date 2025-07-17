import type { DB } from "@/db";
import { carModels } from "@/db/schema";
import type { CarModel } from "@/schemas/shared/tables/cars/car-model";
import { eq } from "drizzle-orm";

export async function getCarModelById(
	db: DB,
	id: string,
): Promise<CarModel | null> {
	const record = await db.query.carModels.findFirst({
		where: eq(carModels.id, id),
	});

	if (!record) {
		throw new Error("Car model not found");
	}

	return record;
}
