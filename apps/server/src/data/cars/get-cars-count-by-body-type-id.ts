import { count, eq } from "drizzle-orm";
import { cars } from "@/db/schema";
import type { DB } from "@/db";

export const getCarsCountByBodyTypeId = async (db: DB, bodyTypeId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.bodyTypeId, bodyTypeId))

	return result.value;
};
