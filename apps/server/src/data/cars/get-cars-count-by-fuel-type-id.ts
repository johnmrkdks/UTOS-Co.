import { count } from "drizzle-orm";
import { db } from "@db/index";
import { cars } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByFuelTypeId = async (db: DB, fuelTypeId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(cars)
    .where((cars) => cars.fuelTypeId.eq(parseInt(fuelTypeId, 10)));

  return result.value;
};