import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByDriveTypeId = async (
	db: DB,
	driveTypeId: string,
) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.driveTypeId, driveTypeId));

	return result.value;
};
