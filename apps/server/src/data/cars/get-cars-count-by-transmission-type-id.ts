import { count } from "drizzle-orm";
import { db } from "@db/index";
import { cars } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByTransmissionTypeId = async (db: DB, transmissionTypeId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(cars)
    .where((cars) => cars.transmissionTypeId.eq(parseInt(transmissionTypeId, 10)));

  return result.value;
};