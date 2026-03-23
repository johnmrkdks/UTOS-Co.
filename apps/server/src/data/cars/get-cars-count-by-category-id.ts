import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByCategoryId = async (db: DB, categoryId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.categoryId, categoryId));

	return result.value;
};
