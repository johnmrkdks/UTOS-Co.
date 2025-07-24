import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCarDriveTypeById(db: DB, id: string) {
	const [carDriveType] = await db.select().from(carDriveTypes).where(eq(carDriveTypes.id, id));

	return carDriveType;
}
