import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarDriveType } from "@/schemas/shared";
import { carDriveTypes } from "@/db/schema";

export async function updateCarDriveType(db: DB, id: string, data: UpdateCarDriveType) {
	const [updatedCarDriveType] = await db.update(carDriveTypes).set(data).where(eq(carDriveTypes.id, id)).returning();
	return updatedCarDriveType;
}
