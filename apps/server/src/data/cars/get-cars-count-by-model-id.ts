import { count, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { cars } from "@/db/schema";

export const getCarsCountByModelId = async (db: DB, modelId: string) => {
	const [result] = await db
		.select({
			value: count(),
		})
		.from(cars)
		.where(eq(cars.modelId, modelId));

	return result.value;
};
