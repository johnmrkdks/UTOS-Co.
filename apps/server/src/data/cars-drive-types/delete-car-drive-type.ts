import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import type { CarDriveType } from "@/schemas/shared/tables/cars/car-drive-type";
import { eq } from "drizzle-orm";

export async function deleteCarDriveType(
	db: DB,
	id: string,
): Promise<CarDriveType> {
	const [record] = await db
		.delete(carDriveTypes)
		.where(eq(carDriveTypes.id, id))
		.returning();

	return record;
}
