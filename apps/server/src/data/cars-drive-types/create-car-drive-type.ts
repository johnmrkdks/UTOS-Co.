import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import type { CarDriveType, InsertCarDriveType } from "@/schemas/shared/tables/car-drive-type";
import { carDriveTypes } from "@/db/schema";

type CreateCarDriveTypeParams = InsertCarDriveType;

export async function createCarDriveType(db: DB, params: CreateCarDriveTypeParams): Promise<CarDriveType> {
	const [record] = await db.insert(carDriveTypes).values(params).returning();

	return record;
}
