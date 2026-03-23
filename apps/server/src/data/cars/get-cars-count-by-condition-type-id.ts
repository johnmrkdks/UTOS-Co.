import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByConditionTypeId = async (
	db: DB,
	conditionTypeId: string,
) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.conditionTypeId, conditionTypeId));

	return result.value;
};
