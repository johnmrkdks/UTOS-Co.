import type { DB } from "@/db";
import { cars } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CarBodyType } from "@/schemas/shared/tables/cars/car-body-type";

export async function getCarBodyTypeById(
	db: DB,
	id: string,
): Promise<CarBodyType | null> {
	const record = await db.query.carBodyTypes.findFirst({
		where: eq(cars.id, id),
	});

	if (!record) {
		throw new Error("Car body type not found");
	}

	return record;
}
