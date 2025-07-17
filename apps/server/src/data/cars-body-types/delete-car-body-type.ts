import type { DB } from "@/db";
import { carBodyTypes } from "@/db/schema";
import type { CarBodyType } from "@/schemas/shared/tables/cars/car-body-type";
import { eq } from "drizzle-orm";

export async function deleteCarBodyType(
	db: DB,
	id: string,
): Promise<CarBodyType> {
	const [record] = await db
		.delete(carBodyTypes)
		.where(eq(carBodyTypes.id, id))
		.returning();

	return record;
}
