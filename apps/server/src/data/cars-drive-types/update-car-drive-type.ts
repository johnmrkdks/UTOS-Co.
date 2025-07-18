import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateCarDriveType } from "@/schemas/shared/tables/car-drive-type";
import { carDriveTypes } from "@/db/schema";

export async function updateCarDriveType(db: DB, id: string, data: UpdateCarDriveType) {
	const [updatedCarDriveType] = await db.update(carDriveTypes).set(data).where(eq(carDriveTypes.id, id)).returning();
	return updatedCarDriveType;
}
