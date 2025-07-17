import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import type { CarDriveType } from "@/schemas/shared/tables/cars/car-drive-type";
import { eq } from "drizzle-orm";

export async function getCarDriveType(
	db: DB,
	id: string,
): Promise<CarDriveType | null> {
	const record = await db.query.carDriveTypes.findFirst({
		where: eq(carDriveTypes.id, id),
	});

	if (!record) {
		throw new Error("Car drive type not found");
	}

	return record;
}
