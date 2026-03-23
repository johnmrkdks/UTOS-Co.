import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import type { UpdateCarDriveType } from "@/schemas/shared";

type UpdateCarDriveTypeParams = {
	id: string;
	data: UpdateCarDriveType;
};

export async function updateCarDriveType(
	db: DB,
	{ id, data }: UpdateCarDriveTypeParams,
) {
	const [updatedCarDriveType] = await db
		.update(carDriveTypes)
		.set(data)
		.where(eq(carDriveTypes.id, id))
		.returning();
	return updatedCarDriveType;
}
