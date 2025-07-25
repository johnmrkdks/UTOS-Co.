import { count } from "drizzle-orm";
import { db } from "@db/index";
import { cars } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByConditionTypeId = async (db: DB, conditionTypeId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(cars)
    .where((cars) => cars.conditionTypeId.eq(parseInt(conditionTypeId, 10)));

  return result.value;
};