import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";

export const getCarDriveTypeById = async (db: DB, id: string) => {
	const carDriveType = await db.query.carDriveTypes.findFirst({
		where: eq(carDriveTypes.id, id),
	});

	return carDriveType;
};
