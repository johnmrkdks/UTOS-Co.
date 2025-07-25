import { count, eq } from "drizzle-orm";
import { cars } from "@/db/schema";
import type { DB } from "@/db";

export const getCarsCountByDriveTypeId = async (db: DB, driveTypeId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.driveTypeId, driveTypeId))

	return result.value;
};
