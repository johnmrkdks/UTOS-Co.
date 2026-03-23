import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";

export async function deleteCarDriveType(db: DB, id: string) {
	const [deletedCarDriveType] = await db
		.delete(carDriveTypes)
		.where(eq(carDriveTypes.id, id))
		.returning();
	return deletedCarDriveType;
}
