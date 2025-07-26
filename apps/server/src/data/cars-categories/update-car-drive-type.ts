import type { DB } from "@/db";
import { eq } from "drizzle-orm";
import type { UpdateCarDriveType } from "@/schemas/shared";
import { carDriveTypes } from "@/db/schema";

type UpdateCarDriveTypeParams = {
	id: string;
	data: UpdateCarDriveType;
};

export async function updateCarDriveType(db: DB, { id, data }: UpdateCarDriveTypeParams) {
	const [updatedCarDriveType] = await db.update(carDriveTypes).set(data).where(eq(carDriveTypes.id, id)).returning();
	return updatedCarDriveType;
}
