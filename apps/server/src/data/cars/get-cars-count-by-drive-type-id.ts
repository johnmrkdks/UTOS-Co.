import { count } from "drizzle-orm";
import { db } from "@db/index";
import { cars } from "@db/schema/cars";
import type { DB } from "@/db";

export const getCarsCountByDriveTypeId = async (db: DB, driveTypeId: string) => {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(cars)
    .where((cars) => cars.driveTypeId.eq(parseInt(driveTypeId, 10)));

  return result.value;
};