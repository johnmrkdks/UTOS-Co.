import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import type {
	CarDriveType,
	UpdateCarDriveType,
} from "@/schemas/shared/tables/cars/car-drive-type";
import { eq } from "drizzle-orm";

type UpdateCarDriveTypeParams = {
	id: string;
	data: Partial<UpdateCarDriveType>;
};

export async function updateCarDriveType(
	db: DB,
	params: UpdateCarDriveTypeParams,
): Promise<CarDriveType> {
	const { id, data } = params;

	const [record] = await db
		.update(carDriveTypes)
		.set(data)
		.where(eq(carDriveTypes.id, id))
		.returning();

	return record;
}
