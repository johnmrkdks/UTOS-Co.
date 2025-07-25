import { count } from "drizzle-orm";
import { db } from "@db/index";
import { cars } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByModelId = async (db: DB, modelId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(cars)
    .where((cars) => cars.modelId.eq(parseInt(modelId, 10)));

  return result.value;
};