import type { DB } from "@/db";
import { carDriveTypes } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCarDriveTypeById = async (db: DB, id: string) => {
	const carDriveType = await db.query.carDriveTypes.findFirst({
		where: eq(carDriveTypes.id, parseInt(id, 10)),
	});

	return carDriveType;
};
