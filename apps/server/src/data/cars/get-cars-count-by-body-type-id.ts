import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByBodyTypeId = async (db: DB, bodyTypeId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.bodyTypeId, bodyTypeId));

	return result.value;
};
