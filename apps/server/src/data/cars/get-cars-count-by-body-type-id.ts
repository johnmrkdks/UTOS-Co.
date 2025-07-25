import { count } from "drizzle-orm";
import { db } from "@db/index";
import { cars } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByBodyTypeId = async (db: DB, bodyTypeId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(cars)
    .where((cars) => cars.bodyTypeId.eq(parseInt(bodyTypeId, 10)));

  return result.value;
};