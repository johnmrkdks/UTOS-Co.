import { count, eq } from "drizzle-orm";
import { cars } from "@/db/schema";
import type { DB } from "@/db";

export const getCarsCountByModelId = async (db: DB, modelId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.modelId, modelId))

	return result.value;
};
